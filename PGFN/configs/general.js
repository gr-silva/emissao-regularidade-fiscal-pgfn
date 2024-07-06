const baseUrl =
  "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet";

const basePJUrl = `${baseUrl}/PJ`;
const basePFUrl = `${baseUrl}/PF`;

const URLS = {
  ISSUE: {
    PJ: `${basePJUrl}/EmitirPGFN`,
    PF: `${basePFUrl}/EmitirPGFN`,
  },
  AUTHENTICATE: {
    PJ: `${basePJUrl}/AutenticidadePGFN/Confirmar`,
    PF: `${basePFUrl}/AutenticidadePGFN/Confirmar`,
  },
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

module.exports = { URLS, BROWSER_OPTIONS, DOWNLOAD_PATH };
