

export default class WebRobot {
  constructor(timeout = 30000) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
  }
}
