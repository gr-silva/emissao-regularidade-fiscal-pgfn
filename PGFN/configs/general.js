const baseUrl =
  "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet";

const PJ_URL = `${baseUrl}/PJ/EmitirPGFN`;
const PF_URL = `${baseUrl}/PF/EmitirPGFN`;

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

module.exports = { PJ_URL, PF_URL, BROWSER_OPTIONS, DOWNLOAD_PATH };
