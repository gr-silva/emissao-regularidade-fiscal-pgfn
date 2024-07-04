const WebRobot = require("../WebRobot/src/WebRobot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");

class PGFN {
  constructor(idCodes = [], processmentType = "", timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
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
      return "Site da PGFN acessado com sucesso.";
    } catch (error) {
      return await _start(--LIMITER);
    }
  }

  async _consultTaxRegularityCertificate(idCode, LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar certidão.");
    const consultButton = this._selectors.BUTTONS.CONSULT;
    const newConsultButton = this._selectors.BUTTONS.NEW_CONSULT;

    try {
      await this.__fillIdCode(idCode);
      await this._robot.click(consultButton);
      await this.__waitForLoading();
      //TODO: IMPLEMENTAR CHECAGEM SE CERTIDÃO JÁ FOI EMITIDA. CASO TENHA SIDO, CLICAR PARA EMITIR NOVA CERTIDÃO.
      await this._robot.delay(1000);
      await this._robot.verifyDownload(configs.DOWNLOAD_PATH);
      await this._robot.click(newConsultButton);
    } catch (error) {
      return await this._consultTaxRegularityCertificate(idCode, --LIMITER);
    }
  }

  async __waitForLoading() {
    const loading = this._selectors.LOADING;
    await this._robot.delay(500);

    const isLoading = await this._robot.getElementAttribute(loading, "class");
    if (isLoading) {
      return await this.__waitForLoading();
    }
    return true;
  }

  async __fillIdCode(idCode, LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao inserir CPF ou CNPJ.");
    const idCodeInput = this._selectors.INPUTS.ID_CODE;

    try {
      await this._robot.setText(idCode, idCodeInput, true);
    } catch (error) {
      return await this.__fillIdCode(--LIMITER);
    }
  }

  async generateTaxRegularityCertificate() {
    await this._start();
    await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
    for (const idCode of this._idCodes) {
      console.log(idCode);
      await this._robot.delay(2000);
      await this._consultTaxRegularityCertificate(idCode);
      await this._robot.delay(5000);
    }

    await this._robot.close();
  }
}

module.exports = PGFN;
