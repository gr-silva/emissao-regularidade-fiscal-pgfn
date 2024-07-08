const PGFN = require("../PGFN/src/index.js");
const ValidateCNPJ = require("../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../PGFN/utils/cpf/validate-cpf.js");
const express = require("express");
const generateCertificateRoute = require("./routes/generate-certificates.js");
const app = express();

app.use(express.json());

generateCertificateRoute(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
