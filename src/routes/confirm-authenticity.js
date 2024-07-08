const PGFN = require("../../PGFN/src/index.js");
const ValidateCNPJ = require("../../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../../PGFN/utils/cpf/validate-cpf.js");
const Joi = require("joi");

const certificateSchema = Joi.object({
  control_code: Joi.string().required(),
  date_of_issue: Joi.string().required(), // verificar se pode incluir formato de data aceito
  issue_time: Joi.string()
    .pattern(/^\d{2}:\d{2}:\d{2}$/)
    .required(),
  type_of_certificate: Joi.string().required(),
});

const dataSchema = Joi.object().pattern(
  Joi.string().length(11).pattern(/^\d+$/), // Chaves são strings de 11 dígitos numéricos
  certificateSchema
);

module.exports = (app) => {
  app.post("/confirmar-autenticidade", async (req, res) => {
    const { taxPayersIdObject } = req.body;
    const { error } = dataSchema.validate(taxPayersIdObject);
    if (error) {
      return res.status(400).json({ error: error.details });
    }
    const results = await Promise.all(
      taxPayersIdObject.map(async (taxPayerId) => {
        const controlCode = taxPayersIdObject[taxPayerId].control_code;
        const dateOfIssue = taxPayersIdObject[taxPayerId].date_of_issue;
        const issueTime = taxPayersIdObject[taxPayerId].issue_time;
        const typeOfCertificate =
          taxPayersIdObject[taxPayerId].type_of_certificate;

        if (ValidateCPF(taxPayerId)) {
          const pgfn = new PGFN([ClearCPF(taxPayerId)], "PF");
          return pgfn.confirmAuthenticityOfTaxRegularity(
            controlCode,
            dateOfIssue,
            issueTime,
            typeOfCertificate
          );
        } else if (ValidateCNPJ(taxPayerId)) {
          const pgfn = new PGFN([ClearCNPJ(taxPayerId)], "PJ");
          return pgfn.confirmAuthenticityOfTaxRegularity(
            controlCode,
            dateOfIssue,
            issueTime,
            typeOfCertificate
          );
        } else {
          return {
            [taxPayerId]: {
              codigo_controle: controlCode,
              data_emissao: dateOfIssue,
              hora_emissao: issueTime,
              status: "falha",
              motivo_erro: error.message,
              observacao: null,
            },
          };
        }
      })
    );
    res.json(results);
  });
};
