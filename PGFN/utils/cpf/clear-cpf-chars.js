const { cpf } = require("cpf-cnpj-validator");

const ClearCPF = (cpfNumber) => {
  return cpf.strip(cpfNumber);
};

module.exports = ClearCPF;
