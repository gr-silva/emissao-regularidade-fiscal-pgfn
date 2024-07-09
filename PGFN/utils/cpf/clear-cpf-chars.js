const { cpf } = require("cpf-cnpj-validator");

/**
 * The ClearCPF function takes a CPF number as input and removes any formatting
 * characters from it.
 * @param cpfNumber - The `cpfNumber` parameter in the `ClearCPF` function is the
 * input value representing a CPF (Cadastro de Pessoas Físicas) number, which is a
 * unique identification number assigned to Brazilian citizens and residents.
 * @returns The `ClearCPF` function is returning the result of calling the `strip`
 * method on the `cpf` object with the `cpfNumber` parameter passed to the
 * function.
 */
const ClearCPF = (cpfNumber) => {
  return cpf.strip(cpfNumber);
};

module.exports = ClearCPF;
