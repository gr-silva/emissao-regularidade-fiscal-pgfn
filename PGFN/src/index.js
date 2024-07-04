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

  async start(LIMITER = 3) {
    if (!LIMITER) throw new Error("Portal fora do ar.");
    try {
      if (this._processmentType === "PF") {
        this._robot.start(configs.PF_URL, configs.BROWSER_OPTIONS);
        return "Site da PGFN acessado com sucesso.";
      }
      if (this._processmentType === "PJ") {
        this._robot.start(configs.PJ_URL, configs.BROWSER_OPTIONS);
        return "Site da PGFN acessado com sucesso.";
      }
      return "CPF ou CNPJ Inválido.";
    } catch (error) {
      console.log(error);
      return await start(--LIMITER);
    }
  }

  async generateTaxRegularityCertificate() {
    await this.start();
    for (const idCode of this._idCodes) {
      console.log(idCode);
    }
  }
}

module.exports = PGFN;
