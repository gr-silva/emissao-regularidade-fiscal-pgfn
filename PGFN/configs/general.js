const baseUrl =
  "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet";

const basePJUrl = `${baseUrl}/PJ`;
const basePFUrl = `${baseUrl}/PF`;

const PGFN_URLS = {
  ISSUE_PJ: `${basePJUrl}/EmitirPGFN`,
  ISSUE_PF: `${basePFUrl}/EmitirPGFN`,
  AUTHENTICATE_PJ: `${basePJUrl}/AutenticidadePGFN/Confirmar`,
  AUTHENTICATE_PF: `${basePFUrl}/AutenticidadePGFN/Confirmar`,
};

const BROWSER_OPTIONS = {
  headless: false,
  defaultViewport: {
    width: 1366,
    height: 768,
  },
  timeout: 3000,
  ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
  args: [
    "--start-maximized",
    "--ignore-certificate-errors",
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
  ],
};

const DOWNLOAD_PATH = "./downloads";

module.exports = { PGFN_URLS, BROWSER_OPTIONS, DOWNLOAD_PATH };
