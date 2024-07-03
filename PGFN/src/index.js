const WebRobot = require("../WebRobot/src/WebRobot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");
const ValidateCPF = require("../utils/validate-cpf");
const ValidateCNPJ = require("../utils/validate-cnpj");

class PGFN {
  constructor(idCode, timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
    this._idCode = idCode;
  }

  async start(LIMITER = 3) {
    //TODO: INCLUIR VERIFICAÇÃO SE É CPF OU CNPJ. SE FOR CPF, ACESSAR PF_URL, SE FOR CNPJ, ACESSAR PJ_URL
    if (ValidateCPF(this._idCode)) {
      this._robot.start(configs.PF_URL, configs.BROWSER_OPTIONS);
    }
    if (ValidateCNPJ(this._idCode)) {
      this._robot.start(configs.PJ_URL, configs.BROWSER_OPTIONS);
    }

    return "CPF ou CNPJ Inválido.";
  }
}

module.exports = PGFN;
