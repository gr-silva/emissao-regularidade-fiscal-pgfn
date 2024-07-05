const INPUTS = {
  ID_CODE: "#NI",
};

const BUTTONS = {
  CONSULT: "#validar",
  ISSUE_NEW_CERTIFICATE: "#FrmSelecao > a:nth-child(6)",
  NEW_CONSULT:
    "#main-container > div > table > tbody > tr > td > div > a:nth-child(1) > input[type=button]",
};

const MODALS = {
  ERROR:
    "body > div.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons.ui-draggable",
};

const TITLES = {
  RESULT_OF_CONSULT:
    "#main-container > div > table > tbody > tr > td > h3:nth-child(2)",
};

const MESSAGES = {
  ERROR_MESSAGE: "#mensagem",
  RESULT_OF_CONSULT: "#main-container > div > table > tbody > tr > td",
};

const LOADING = "body";

module.exports = { INPUTS, BUTTONS, MODALS, MESSAGES, LOADING, TITLES };
