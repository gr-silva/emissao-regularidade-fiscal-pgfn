const PGFN = require("../PGFN/src");
const separateIdCodes = require("../PGFN/utils/helpers/separate-id-codes.js");
const mockIdCodes = require("../mock.js");

const separatedIdCodes = separateIdCodes(mockIdCodes);

//TODO: CRIAR PARALELISMO COM puppeteer-cluster E INSERIR ETAPA DE CNPJ NO FLUXO ABAIXO.
const pgfn = new PGFN(separatedIdCodes.cpf, "PF");
pgfn.generateTaxRegularityCertificate();
