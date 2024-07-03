const WebRobot = require("../WebRobot/src/WebRobot");
const selectors = require("../configs/selectors");
const configs = require("../configs/configs");

class PGFN {
  constructor(timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
  }

  async start() {
    this._robot.start(configs.URL, configs.BROWSER_OPTIONS);
  }
}
