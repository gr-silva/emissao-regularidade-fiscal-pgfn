const WebRobot = require("../WebRobot/src/WebRobot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");
const s3Client = require("../AWS/s3Client");
const path = require("path");

class PGFN {
  constructor(documentNumbers = [], processmentType = "", timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._documentNumber = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
    this._documentNumbers = documentNumbers;
    this._processmentType = processmentType;

    if (this._documentNumbers.length === 0) {
      throw new Error("Nenhuma lista com CPF ou CNPJ foi informado.");
    }

    if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
      throw new Error(
        "Tipo de processamento inválido. Tipos aceitáveis: PF ou PJ."
      );
    }
  }

  async _start(LIMITER = 3) {
    if (!LIMITER) throw new Error("Portal fora do ar.");
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    const url =
      this._processmentType === "PF"
        ? configs.PGFN_URLS.ISSUE_PF
        : configs.PGFN_URLS.ISSUE_PJ;

    try {
      if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
        return "CPF ou CNPJ Inválido.";
      }
      await this._robot.start(url, configs.BROWSER_OPTIONS);
      await this._robot.waitForSelector(documentNumberInput);
      await this._robot.delay(2000);
      return "Site da PGFN acessado com sucesso.";
    } catch (error) {
      console.log(error);
      await this._robot.close();
      return await this._start(--LIMITER);
    }
  }

  async _consultDocumentNumber(LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar CPF ou CNPJ.");
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    const consultButton = this._selectors.BUTTONS.CONSULT;

    try {
      await this._robot.setText(
        this._documentNumber,
        documentNumberInput,
        true
      );
      await this._robot.delay(1000);
      await this._robot.click(consultButton);
      const { hasError, message } = await this.__handleDocumentNumberError();
      if (hasError) {
        LIMITER = 0;
        throw new Error(message);
      }
      await this.__handleNetError();
      await this.__waitForLoading();
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.refreshPage();
      await this.__handleNetError();
      return await this._consultDocumentNumber(--LIMITER);
    }
  }

  async _downloadTaxRegularityCertificate(LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar certidão.");
    const newConsultButton = this._selectors.BUTTONS.NEW_CONSULT;
    const message = this._selectors.MESSAGES.RESULT_OF_CONSULT;

    try {
      await this.__reissueCertificate();
      await this.__waitForLoading();
      await this._robot.delay(1000);
      const consultMessage = await this._robot.getElementInnerText(message);
      if (consultMessage.includes("certidão foi emitida com sucesso")) {
        await this._robot.verifyDownload(
          configs.DOWNLOAD_PATH,
          `${this._documentNumber}.pdf`
        );
      } else {
        LIMITER = 0;
        throw new Error(consultMessage);
      }
      await this.__handleNetError();
      // await this._robot.click(newConsultButton);
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.refreshPage();
      await this.__handleNetError();
      await this._consultDocumentNumber(LIMITER - 1);
      return await this._downloadTaxRegularityCertificate(--LIMITER);
    }
  }

  async __handleNetError() {
    const netError = this._selectors.MESSAGES.NET_ERROR;
    try {
      await this._robot.waitForSelector(netError, 1500);
      await this._robot.refreshPage();
      await this._robot.delay(1000);
      return await this.__handleNetError();
    } catch (error) {}
  }

  async __waitForResultOfConsult() {
    const resultOfConsultTitle = this._selectors.TITLES.RESULT_OF_CONSULT;
    await this._robot.waitForSelector(resultOfConsultTitle);
  }

  async __reissueCertificate() {
    const issueNewCertificateButton =
      this._selectors.BUTTONS.ISSUE_NEW_CERTIFICATE;
    try {
      await this._robot.waitForSelector(issueNewCertificateButton, 2000);
      await this._robot.delay(500);
      await this._robot.click(issueNewCertificateButton);
    } catch (error) {}
  }

  async __waitForLoading() {
    const loading = this._selectors.LOADING;
    console.log("Aguardando página carregar...");
    await this._robot.delay(1000);
    const isLoading = await this._robot.getElementAttribute(loading, "class");
    if (isLoading === "loading") {
      return await this.__waitForLoading();
    }
    await this._robot.delay(500);
  }

  async __handleDocumentNumberError() {
    const errorModal = this._selectors.MODALS.ERROR;
    const errorMessage = this._selectors.MESSAGES.ERROR_MESSAGE;
    console.log("Verificando erros no CPF ou CNPJ...");
    await this._robot.delay(1000);
    if (await this._robot.findElement(errorModal)) {
      const styleMessage = await this._robot.getElementAttribute(
        errorModal,
        "style"
      );
      if (!styleMessage.includes("display: none;")) {
        const message = await this._robot.getElementText(errorMessage);
        return { hasError: true, message: message };
      }
    }
    return { hasError: false, message: "" };
  }

  async generateTaxRegularityCertificate() {
    const documentNumberProcessmentReturn = {};

    for (const documentNumber of this._documentNumbers) {
      this._documentNumber = documentNumber;
      const fileName = `Certidao-${this._documentNumber}.pdf`;
      console.log(this._documentNumber);

      try {
        await this._start();
        await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
        await this._consultDocumentNumber();
        await this._downloadTaxRegularityCertificate();
        const s3FileUrl = await s3Client.uploadFile(
          fileName,
          path.resolve(String(configs.DOWNLOAD_PATH), fileName)
        );

        documentNumberProcessmentReturn[this._documentNumber] = {
          status: "sucesso",
          certidao: s3FileUrl,
          motivo_erro: null,
        };
      } catch (error) {
        const errorMessage = error.message
          .replace(/\n/g, "")
          .replace("Resultado da Consulta", "")
          .trim();

        documentNumberProcessmentReturn[this._documentNumber] = {
          status: "falha",
          certidao: null,
          motivo_erro: errorMessage,
        };
      } finally {
        await this._robot.close();
        await this._robot.delay(500 * Math.floor(Math.random() * 5));
      }
    }

    console.log(documentNumberProcessmentReturn);
    return documentNumberProcessmentReturn;
  }
}

module.exports = PGFN;
