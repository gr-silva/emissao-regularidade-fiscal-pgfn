const { cpf } = require("cpf-cnpj-validator");

const ValidateCPF = (cpfNumber) => {
  return cpf.isValid(cpfNumber);
};

module.exports = ValidateCPF;
