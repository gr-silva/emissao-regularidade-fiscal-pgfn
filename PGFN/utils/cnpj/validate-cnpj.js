const { cnpj } = require("cpf-cnpj-validator");

/**
 * The function ValidateCNPJ checks if a given CNPJ number is valid.
 * @param cnpjNumber - The `cnpjNumber` parameter in the `ValidateCNPJ` function is
 * expected to be a string representing a CNPJ number that you want to validate.
 * The function uses a hypothetical `cnpj.isValid` method to check if the provided
 * CNPJ number is valid.
 * @returns The function `ValidateCNPJ` is returning the result of calling the
 * `isValid` method on the `cnpj` object with the `cnpjNumber` parameter.
 */
const ValidateCNPJ = (cnpjNumber) => {
  return cnpj.isValid(cnpjNumber);
};

module.exports = ValidateCNPJ;
