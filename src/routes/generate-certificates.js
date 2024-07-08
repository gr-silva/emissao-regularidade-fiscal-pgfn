const PGFN = require("../../PGFN/src/index.js");
const ValidateCNPJ = require("../../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../../PGFN/utils/cpf/validate-cpf.js");

module.exports = (app) => {
  app.post("/gerar-certidoes", async (req, res) => {
    const { taxPayersId } = req.body;
    if (!Array.isArray(taxPayersId)) {
      return res
        .status(400)
        .json({ error: "O input deve ser um array de CPFs ou CNPjs." });
    }
    const results = await Promise.all(
      taxPayersId.map(async (taxPayerId) => {
        if (ValidateCPF(taxPayerId)) {
          const pgfn = new PGFN([ClearCPF(taxPayerId)], "PF");
          return pgfn.generateTaxRegularityCertificate();
        } else if (ValidateCNPJ(taxPayerId)) {
          const pgfn = new PGFN([ClearCNPJ(taxPayerId)], "PJ");
          return pgfn.generateTaxRegularityCertificate();
        } else {
          return {
            [taxPayerId]: {
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
};
