const INPUTS = {
  ID_CODE: "#NI",
  CONTROL_CODE: "#NumControleCertidao",
  DATE_OF_ISSUE: "#DtEmissaoCertidao",
  ISSUE_TIME: "#HoEmissaoCertidao",
};

const SELECTS = {
  TYPE_OF_CERTIFICATE: "#TipoCertidaoStr",
};

const TABLES = {
  AUTHENTICITY_RESULT: "#main-container > div > table > tbody > tr > td",
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
  RESULT_OF_AUTHENTICITY:
    "#main-container > div > table > tbody > tr > td > h3",
};

const MESSAGES = {
  ERROR_MESSAGE: "#mensagem",
  RESULT_OF_CONSULT: "#main-container > div > table > tbody > tr > td",
  NET_ERROR: "#main-message > h1 > span",
};

const LOADING = "body";

module.exports = {
  INPUTS,
  BUTTONS,
  MODALS,
  MESSAGES,
  LOADING,
  TITLES,
  SELECTS,
  TABLES,
};
