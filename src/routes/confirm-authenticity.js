const PGFN = require("../../PGFN/src/index.js");
const ValidateCNPJ = require("../../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../../PGFN/utils/cpf/validate-cpf.js");
const chunkArray = require("../../PGFN/utils/helpers/create-chunk-array.js");
const Joi = require("joi");

const certificateSchema = Joi.object({
  control_code: Joi.string().required(),
  date_of_issue: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  issue_time: Joi.string()
    .pattern(/^\d{2}:\d{2}:\d{2}$/)
    .required(),
  type_of_certificate: Joi.string().required(),
});

const dataSchema = Joi.object().pattern(
  Joi.string().pattern(/^\d{11}|\d{14}$/),
  certificateSchema
);

/**
 * @swagger
 * /confirmar-autenticidade:
 *   post:
 *     summary: Confirma a autenticidade das certidões de regularidade fiscal para CPFs e CNPJs.
 *     description: Recebe um JSON contendo objetos de CPFs e/ou CNPJs com suas respectivas certidões fiscais e verifica a autenticidade.
 *     tags: [Certidoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             patternProperties:
 *               ^\d{11}|\d{14}$:
 *                 type: object
 *                 properties:
 *                   control_code:
 *                     type: string
 *                     description: Código de controle da certidão (disponibilizada na emissão da certidão).
 *                   date_of_issue:
 *                     type: string
 *                     pattern: ^\d{2}\/\d{2}\/\d{4}$
 *                     description: Data de emissão da certidão no formato DD/MM/AAAA.
 *                   issue_time:
 *                     type: string
 *                     pattern: ^\d{2}:\d{2}:\d{2}$
 *                     description: Hora de emissão da certidão no formato HH:MM:SS.
 *                   type_of_certificate:
 *                     type: string
 *                     values: "Negativa"
 *                     description: Tipo da certidão (Negativa).
 *             example:
 *               "12345678901":
 *                 control_code: "E535.85A3.78B0.7652"
 *                 date_of_issue: "01/07/2024"
 *                 issue_time: "10:30:00"
 *                 type_of_certificate: "Negativa"
 *     responses:
 *       200:
 *         description: Retorna o status da autenticidade para cada CPF ou CNPJ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               patternProperties:
 *                 ^\d{11}|\d{14}$:
 *                   type: object
 *                   properties:
 *                     codigo_controle:
 *                       type: string
 *                     data_emissao:
 *                       type: string
 *                       description: Data de emissão no formato DD/MM/AAAA.
 *                     hora_emissao:
 *                       type: string
 *                       description: Hora de emissão no formato HH:MM:SS.
 *                     status:
 *                       type: string
 *                       enum: [sucesso, falha]
 *                       description: Status da validação da autenticidade.
 *                     motivo_erro:
 *                       type: string
 *                       nullable: true
 *                       description: Mensagem de não autenticidade da certidão (em caso de falha).
 *                     observacao:
 *                       type: string
 *                       nullable: true
 *                       description: Mensagem de autenticidade da certidão (em caso de sucesso).
 *               example:
 *                 "12345678901":
 *                   codigo_controle: "E535.85A3.78B0.7652"
 *                   data_emissao: "01/07/2024"
 *                   hora_emissao: "10:30:00"
 *                   status: "sucesso"
 *                   motivo_erro: null
 *                   observacao: "Certidão Negativa emitida em 02/07/2024, com validade até 29/12/2024."
 *                 "12345678000199":
 *                   codigo_controle: "E535.85A3.78B0.7652"
 *                   data_emissao: "01/07/2024"
 *                   hora_emissao: "10:45:00"
 *                   status: "falha"
 *                   motivo_erro: "CPF ou CNPJ inválido."
 *                   observacao: null
 *       400:
 *         description: Erro de validação dos dados de entrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example:
 *                     "CPF ou CNPJ inválido."
 */

module.exports = (app) => {
  app.post("/confirmar-autenticidade", async (req, res) => {
    try {
      const taxPayersIdObject = req.body;
      const { error } = dataSchema.validate(taxPayersIdObject);
      if (error) {
        return res.status(400).json({ error: error.details });
      }

      const chunkTaxPayersId = chunkArray(Object.keys(taxPayersIdObject), 4);
      const results = {};

      for (const chunkedTaxPayerId of chunkTaxPayersId) {
        const chunkResults = await Promise.all(
          chunkedTaxPayerId.map(async (taxPayerId) => {
            const controlCode = taxPayersIdObject[taxPayerId].control_code;
            const dateOfIssue = taxPayersIdObject[taxPayerId].date_of_issue;
            const issueTime = taxPayersIdObject[taxPayerId].issue_time;
            const typeOfCertificate =
              taxPayersIdObject[taxPayerId].type_of_certificate;

            if (ValidateCPF(taxPayerId)) {
              const pgfn = new PGFN([ClearCPF(taxPayerId)], "PF", {
                verifyAuthenticity: true,
              });
              return pgfn.confirmAuthenticityOfTaxRegularity(
                controlCode,
                dateOfIssue,
                issueTime,
                typeOfCertificate
              );
            } else if (ValidateCNPJ(taxPayerId)) {
              const pgfn = new PGFN([ClearCNPJ(taxPayerId)], "PJ", {
                verifyAuthenticity: true,
              });
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
        chunkResults.forEach((result) => {
          Object.assign(results, result);
        });
      }
      res.json(results);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};
