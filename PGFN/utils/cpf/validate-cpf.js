const { cpf } = require("cpf-cnpj-validator");

/**
 * The function ValidateCPF checks if a given CPF number is valid.
 * @param cpfNumber - The `cpfNumber` parameter in the `ValidateCPF` function is
 * the input value that represents a CPF (Cadastro de Pessoas Físicas) number,
 * which is a unique identification number assigned to Brazilian citizens and
 * residents. The function uses this parameter to validate whether the provided CPF
 * number is valid
 * @returns The function `ValidateCPF` is returning the result of calling
 * `cpf.isValid(cpfNumber)`.
 */
const ValidateCPF = (cpfNumber) => {
  return cpf.isValid(cpfNumber);
};

module.exports = ValidateCPF;
