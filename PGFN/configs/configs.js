export const URL = "https://www.regularize.pgfn.gov.br/";
export const BROWSER_OPTIONS = {
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
