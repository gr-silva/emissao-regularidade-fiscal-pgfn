const WebRobot = require("../WebRobot/src/WebRobot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");

class PGFN {
  constructor(idCodes = [], processmentType = "", timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._idCode = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
    this._idCodes = idCodes;
    this._processmentType = processmentType;

    if (this._idCodes.length === 0) {
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
    const idCodeInput = this._selectors.INPUTS.ID_CODE;
    const url =
      this._processmentType === "PF" ? configs.PF_URL : configs.PJ_URL;

    try {
      if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
        return "CPF ou CNPJ Inválido.";
      }
      await this._robot.start(url, configs.BROWSER_OPTIONS);
      await this._robot.waitForSelector(idCodeInput);
      await this._robot.delay(2000);
      return "Site da PGFN acessado com sucesso.";
    } catch (error) {
      return await this._start(--LIMITER);
    }
  }

  async _consultIdCode(LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar CPF ou CNPJ.");
    const idCodeInput = this._selectors.INPUTS.ID_CODE;
    const consultButton = this._selectors.BUTTONS.CONSULT;

    try {
      await this._robot.setText(this._idCode, idCodeInput, true);
      await this._robot.delay(500);
      await this._robot.click(consultButton);
      const { hasError, message } = await this.__handleIdCodeError();
      if (hasError) {
        LIMITER = 0;
        throw new Error(message);
      }
      await this.__handleNetError();
      await this.__waitForLoading();
    } catch (error) {
      if (error.message.includes("mais tarde")) {
        await this._robot.refreshPage();
        return await this._consultIdCode((LIMITER = 3));
      }

      if (!LIMITER) throw new Error(error.message);
      await this._robot.refreshPage();
      return await this._consultIdCode(--LIMITER);
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
          `${this._idCode}.pdf`
        );
      } else {
        LIMITER = 0;
        throw new Error(consultMessage);
      }
      await this.__handleNetError();
      await this._robot.click(newConsultButton);
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.refreshPage();
      await this._consultIdCode(LIMITER - 1);
      return await this._downloadTaxRegularityCertificate(--LIMITER);
    }
  }

  async __handleNetError() {
    const netError = this._selectors.MESSAGES.NET_ERROR;
    try {
      await this._robot.waitForSelector(netError, 1500);
      await this._robot.refreshPage();
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

  async __handleIdCodeError() {
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
        console.error(message);
        return { hasError: true, message: message };
      }
    }
    return { hasError: false, message: "" };
  }

  async generateTaxRegularityCertificate() {
    const idCodesProcessmentReturn = {};
    await this._start();
    await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);

    for (const idCode of this._idCodes) {
      this._idCode = idCode;
      console.log(this._idCode);

      try {
        await this._consultIdCode();
        await this._downloadTaxRegularityCertificate();

        idCodesProcessmentReturn[this._idCode] = {
          status: "sucesso",
          certidao: "http://link.com.br",
          motivo_erro: null,
        };

        await this._robot.delay(5000);
      } catch (error) {
        idCodesProcessmentReturn[this._idCode] = {
          status: "falha",
          certidao: null,
          motivo_erro: String(error.message),
        };

        await this._robot.refreshPage();
        await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
      }
    }

    await this._robot.close();
    console.log(idCodesProcessmentReturn);
    return idCodesProcessmentReturn;
  }
}

module.exports = PGFN;
