const PGFN = require("../PGFN/src");
const separateIdCodes = require("../PGFN/utils/helpers/separate-id-codes.js");
const mockIdCodes = require("../mock.js");

const separatedIdCodes = separateIdCodes(mockIdCodes);

const pgfn = new PGFN(separatedIdCodes.cpf, "PF");
pgfn.generateTaxRegularityCertificate();
