const ClearCPF = require("../cpf/clear-cpf-chars");
const ClearCNPJ = require("../cnpj/clear-cnpj-chars");

const separateIdCodes = (idCodes) => {
  const cpfCodes = idCodes.filter((idCode) => ClearCPF(idCode).length === 11);
  const cnpjCodes = idCodes.filter((idCode) => ClearCNPJ(idCode).length === 14);
  const anotherCodes = idCodes.filter(
    (idCode) =>
      ClearCNPJ(idCode).length !== 14 && ClearCPF(idCode).length !== 11
  );

  return { cpf: cpfCodes, cnpj: cnpjCodes, another: anotherCodes };
};

module.exports = separateIdCodes;
