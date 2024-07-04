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

const MESSAGES = {
  ERROR_MESSAGE: "#mensagem",
};

const LOADING = "body";

module.exports = { INPUTS, BUTTONS, MODALS, MESSAGES, LOADING };
