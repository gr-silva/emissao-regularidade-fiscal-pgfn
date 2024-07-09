const WebRobot = require("../WebRobot/src/web-robot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");
const s3Client = require("../AWS/s3-client");
const path = require("path");

class PGFN {
  constructor(
    documentNumber = "",
    processmentType = "",
    { timeout = 30000, verifyAuthenticity = false } = {}
  ) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
    this._documentNumber = documentNumber;
    this._processmentType = processmentType;
    this._verifyAuthenticity = verifyAuthenticity;

    if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
      throw new Error(
        "Tipo de processamento inválido. Tipos aceitáveis: PF ou PJ."
      );
    }
  }

  async _start(LIMITER = 3) {
    if (!LIMITER) throw new Error("Portal fora do ar.");
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    let url =
      this._processmentType === "PF"
        ? configs.URLS.ISSUE.PF
        : configs.URLS.ISSUE.PJ;

    if (this._verifyAuthenticity) {
      url =
        this._processmentType === "PF"
          ? configs.URLS.AUTHENTICATE.PF
          : configs.URLS.AUTHENTICATE.PJ;
    }

    try {
      if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
        return "CPF ou CNPJ Inválido.";
      }
      await this._robot.start(url, configs.BROWSER_OPTIONS);
      await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
      await this._robot.waitForSelector(documentNumberInput);
      await this._robot.delay(2000);
      return "Site da PGFN acessado com sucesso.";
    } catch (error) {
      await this._robot.close();
      return await this._start(--LIMITER);
    }
  }

  async _consultDocumentNumber(LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar CPF ou CNPJ.");

    try {
      await this.__insertDocumentNumber();
      await this._robot.delay(1000);
      await this.__consult();
      const { hasError, message } = await this.__handleDocumentNumberError();
      if (hasError) {
        LIMITER = 0;
        throw new Error(message);
      }
      await this.__handleNetError();
      await this.__waitForLoading();
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.close();
      await this._start(LIMITER - 1);
      return await this._consultDocumentNumber(--LIMITER);
    }
  }

  async _downloadTaxRegularityCertificate(LIMITER = 3) {
    if (!LIMITER)
      throw new Error("O portal apresentou falhas ao emitir certidão.");
    const message = this._selectors.MESSAGES.RESULT_OF_CONSULT;

    try {
      await this.__reissueCertificate();
      await this.__waitForLoading();
      await this._robot.delay(1000);
      await this.__waitForResultOfConsult();
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
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.close();
      await this._start(LIMITER - 1);
      await this._consultDocumentNumber(LIMITER - 1);
      return await this._downloadTaxRegularityCertificate(--LIMITER);
    }
  }

  async _fillAuthenticityForm(
    controlCode,
    dateOfIssue,
    issueTime,
    typeOfCertificate
  ) {
    await this.__insertDocumentNumber();
    await this.__insertControlCode(controlCode);
    await this.__insertDateOfIssue(dateOfIssue);
    await this.__insertIssueTime(issueTime);
    await this.__selectTypeOfCertificate(typeOfCertificate);
    await this.__consult();
  }

  async __insertDocumentNumber() {
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    await this._robot.setValue(this._documentNumber, documentNumberInput);
  }
  async __insertControlCode(controlCode) {
    const controlCodeInput = this._selectors.INPUTS.CONTROL_CODE;
    await this._robot.setValue(controlCode, controlCodeInput);
  }
  async __insertDateOfIssue(dateOfIssue) {
    const dateOfIssueInput = this._selectors.INPUTS.DATE_OF_ISSUE;
    await this._robot.setValue(dateOfIssue, dateOfIssueInput);
  }
  async __insertIssueTime(issueTime) {
    const issueTimeInput = this._selectors.INPUTS.ISSUE_TIME;
    await this._robot.setValue(issueTime, issueTimeInput);
  }

  async __selectTypeOfCertificate(typeOfCertificate) {
    const typeOfCertificateSelect = this._selectors.SELECTS.TYPE_OF_CERTIFICATE;
    await this._robot.selectOptionFromDropdown(
      typeOfCertificateSelect,
      typeOfCertificate
    );
  }

  async __consult() {
    const consultButton = this._selectors.BUTTONS.CONSULT;
    await this._robot.click(consultButton);
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

  async __waitForResultOfConsult(LIMITER = 60) {
    const resultOfConsultTitle = !this._verifyAuthenticity
      ? this._selectors.TITLES.RESULT_OF_CONSULT
      : this._selectors.TITLES.RESULT_OF_AUTHENTICITY;

    console.log("Aguardando resultado da consulta...");
    await this._robot.delay(1000);
    while (!(await this._robot.findElement(resultOfConsultTitle)) && LIMITER) {
      return await this.__waitForResultOfConsult(--LIMITER);
    }

    if (!LIMITER)
      throw new Error(
        "Portal não está respondendo. Tente novamente mais tarde."
      );
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
    await this._robot.delay(1500);
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
  async _getAuthenticityResult() {
    const authenticityResult = this._selectors.TABLES.AUTHENTICITY_RESULT;
    await this.__waitForResultOfConsult();
    let result = await this._robot.getElementText(authenticityResult);
    result = result.split("\n").filter((item) => item.trim() !== "");
    return result[result.length - 3].trim();
  }

  async confirmAuthenticityOfTaxRegularity(
    controlCode,
    dateOfIssue,
    issueTime,
    typeOfCertificate = "Negativa"
  ) {
    const authenticityProcessmentReturn = {};

    try {
      await this._start();
      await this._fillAuthenticityForm(
        controlCode,
        dateOfIssue,
        issueTime,
        typeOfCertificate
      );
      const authenticityResult = await this._getAuthenticityResult();

      if (authenticityResult.includes("não é autêntica"))
        throw new Error(authenticityResult);

      authenticityProcessmentReturn[this._documentNumber] = {
        codigo_controle: controlCode,
        data_emissao: dateOfIssue,
        hora_emissao: issueTime,
        status: "sucesso",
        motivo_erro: null,
        observacao: authenticityResult,
      };
    } catch (error) {
      authenticityProcessmentReturn[this._documentNumber] = {
        codigo_controle: controlCode,
        data_emissao: dateOfIssue,
        hora_emissao: issueTime,
        status: "falha",
        motivo_erro: error.message,
        observacao: null,
      };
    } finally {
      await this._robot.close();
      await this._robot.delay(500 * Math.floor(Math.random() * 5));
    }

    return authenticityProcessmentReturn;
  }

  async generateTaxRegularityCertificate() {
    const documentNumberProcessmentReturn = {};

    const fileName = `Certidao-${this._documentNumber}.pdf`;
    console.log(this._documentNumber);

    try {
      await this._start();
      await this._consultDocumentNumber();
      await this._downloadTaxRegularityCertificate();
      await this._robot.delay(500);
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
      await this._robot.delay(1000 * Math.floor(Math.random() * 5));
    }

    return documentNumberProcessmentReturn;
  }
}

module.exports = PGFN;
