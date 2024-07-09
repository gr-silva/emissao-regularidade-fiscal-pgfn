const PGFN = require("../../PGFN/src/index.js");
const ValidateCNPJ = require("../../PGFN/utils/cnpj/validate-cnpj.js");
const ClearCNPJ = require("../../PGFN/utils/cnpj/clear-cnpj-chars.js");
const ClearCPF = require("../../PGFN/utils/cpf/clear-cpf-chars.js");
const ValidateCPF = require("../../PGFN/utils/cpf/validate-cpf.js");
const chunkArray = require("../../PGFN/utils/helpers/create-chunk-array");

/**
 * @swagger
 * tags:
 *   name: Certidoes
 *   description: API para gerenciamento de certidões de regularidade fiscal
 */

/**
 * @swagger
 * /gerar-certidoes:
 *   post:
 *     summary: Gera certidões de regularidade fiscal para CPFs e CNPJs.
 *     description: Recebe um array de CPFs e/ou CNPJs e gera certidões de regularidade fiscal.
 *     tags: [Certidoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example: ["12345678901", "12345678000199"]
 *     responses:
 *       200:
 *         description: Retorna um JSON contendo o status, link para a certidão gerada de cada CPF ou CNPJ e motivo de erro.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [sucesso, falha]
 *                   certidao:
 *                     type: string
 *                     nullable: true
 *                     description: URL para acessar a certidão gerada (em caso de sucesso).
 *                   motivo_erro:
 *                     type: string
 *                     nullable: true
 *                     description: Motivo do erro (em caso de falha).
 *               example:
 *                  "12345678901":
 *                     status: "sucesso"
 *                     certidao: "https://s3.amazonaws.com/emissao-regularidade-fiscal-pgfn/Certidao-12345678901.pdf"
 *                     motivo_erro: null
 *                  "12345678000199":
 *                     status: "falha"
 *                     certidao: null
 *                     motivo_erro: "CPF ou CNPJ inválido."
 *       400:
 *         description: O input deve ser um array de CPFs ou CNPjs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O input deve ser um array de CPFs ou CNPjs."
 *
 */

module.exports = (app) => {
  app.post("/gerar-certidoes", async (req, res) => {
    try {
      const taxPayersId = req.body;

      if (!Array.isArray(taxPayersId) || taxPayersId.length === 0) {
        return res
          .status(400)
          .json({ error: "O input deve ser um array de CPFs ou CNPjs." });
      }

      const chunkTaxPayersId = chunkArray(taxPayersId, 2);
      const results = {};

      for (const chunkedTaxPayerId of chunkTaxPayersId) {
        const chunkResults = await Promise.all(
          chunkedTaxPayerId.map(async (taxPayerId) => {
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
