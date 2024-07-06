const PGFN = require("../PGFN/src/index.js");
const ValidateCNPJ = require("../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../PGFN/utils/cpf/validate-cpf.js");
const express = require("express");
const app = express();

app.use(express.json());

app.post("/gerar-certidoes", async (req, res) => {
  const { documentNumbers } = req.body;
  if (!Array.isArray(documentNumbers)) {
    return res
      .status(400)
      .json({ error: "O input deve ser um array de CPFs ou CNPjs." });
  }
  const results = await Promise.all(
    documentNumbers.map(async (document) => {
      if (ValidateCPF(document)) {
        const pgfn = new PGFN([ClearCPF(document)], "PF");
        return pgfn.generateTaxRegularityCertificate();
      } else if (ValidateCNPJ(document)) {
        const pgfn = new PGFN([ClearCNPJ(document)], "PJ");
        return pgfn.generateTaxRegularityCertificate();
      } else {
        return {
          [document]: {
            status: "falha",
            certidao: null,
            motivo_erro: "CPF ou CNPJ inválido.",
          },
        };
      }
    })
  );
  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
