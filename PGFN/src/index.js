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
      console.log(error);
      return await _start(--LIMITER);
    }
  }

  async generateTaxRegularityCertificate() {
    await this._start();
    for (const idCode of this._idCodes) {
      console.log(idCode);
    }

    await this._robot.close();
  }
}

module.exports = PGFN;
