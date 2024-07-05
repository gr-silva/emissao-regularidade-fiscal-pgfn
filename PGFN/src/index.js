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
    const idCodeInput = this._selectors.INPUTS.ID_CODE;
    const consultButton = this._selectors.BUTTONS.CONSULT;

    try {
      await this._robot.setText(this._idCode, idCodeInput, true);
      await this._robot.delay(500);
      await this._robot.click(consultButton);
      const { hasError, message } = await this.__handleIdCodeError();
      if (hasError) {
        throw new Error(message);
      }
      await this.__waitForLoading();
    } catch (error) {
      console.log(error.message);
      if (!LIMITER) throw new Error(error.message);
      await this._robot.close();
      await this._start(--LIMITER);
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
      }

      await this._robot.click(newConsultButton);
      //TODO: ADICIONAR RETORNO DA FUNÇÃO DE CONSULTA PARA O OBJETO ESPECIFICADO
    } catch (error) {
      console.log(error.message);
      await this._robot.close();
      await this._start(--LIMITER);
      await this._consultIdCode(--LIMITER);
      return await this._downloadTaxRegularityCertificate(--LIMITER);
    }
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
    } catch (error) {
      console.log("");
    }
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
    //FIXME: Verificar o motivo de não estar conseguindo retornar a mensagem do erro
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
        console.log(message);
        return { error: true, message: message };
      }
    }
    console.log("Não encontrei o modal de erro.");
    return { error: false, message: "" };
  }

  async generateTaxRegularityCertificate() {
    await this._start();
    await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
    for (const idCode of this._idCodes) {
      this._idCode = idCode;
      console.log(this._idCode);
      await this._consultIdCode();
      await this._downloadTaxRegularityCertificate();
      await this._robot.delay(5000);
    }

    await this._robot.close();
  }
}

module.exports = PGFN;
