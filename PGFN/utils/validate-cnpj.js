const { cnpj } = require("cpf-cnpj-validator");

const ValidateCNPJ = (cnpjNumber) => {
  return cnpj.isValid(cnpjNumber);
};

module.exports = ValidateCNPJ;
