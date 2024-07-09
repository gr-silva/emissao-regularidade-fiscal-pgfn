const { cnpj } = require("cpf-cnpj-validator");

/**
 * The ClearCNPJ function removes any formatting from a given CNPJ number.
 * @param cnpjNumber - The `cnpjNumber` parameter in the `ClearCNPJ` function is
 * the CNPJ number that you want to clear or strip of any formatting characters.
 * The function is designed to remove any non-numeric characters from the CNPJ
 * number.
 * @returns The function `ClearCNPJ` is returning the result of stripping any
 * non-numeric characters from the `cnpjNumber` input.
 */
const ClearCNPJ = (cnpjNumber) => {
  return cnpj.strip(cnpjNumber);
};

module.exports = ClearCNPJ;
