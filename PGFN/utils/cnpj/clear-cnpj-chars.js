const { cnpj } = require("cpf-cnpj-validator");

const ClearCNPJ = (cnpjNumber) => {
  return cnpj.strip(cnpjNumber);
};

module.exports = ClearCNPJ;
