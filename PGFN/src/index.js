const WebRobot = require("../WebRobot/src/web-robot");
const selectors = require("../configs/selectors");
const configs = require("../configs/general");
const s3Client = require("../AWS/s3-client");
const path = require("path");

class PGFN {
  constructor(
    documentNumber = "",
    processmentType = "",
    { timeout = 30000, verifyAuthenticity = false } = {}
  ) {
    this._timeout = timeout;
    this._browser = "";
    this._page = "";
    this._robot = new WebRobot(timeout);
    this._selectors = selectors;
    this._documentNumber = documentNumber;
    this._processmentType = processmentType;
    this._verifyAuthenticity = verifyAuthenticity;

    if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
      throw new Error(
        "Tipo de processamento inválido. Tipos aceitáveis: PF ou PJ."
      );
    }
  }

  /**
   * The function `_start` is an asynchronous function that accesses a website
   * based on certain conditions and handles errors by retrying a limited number of
   * times.
   * @param [LIMITER=3] - The `LIMITER` parameter in the `_start` function
   * determines the maximum number of attempts to access the PGFN website before
   * throwing an error. If the `LIMITER` reaches 0, it will throw an error "Portal
   * fora do ar." and stop further attempts to access the website. Each
   * @returns The function `_start` returns a string message indicating whether the
   * site of PGFN was accessed successfully or if there was an error. The possible
   * return values are:
   * 1. "Site da PGFN acessado com sucesso." - Indicates that the site of PGFN was
   * accessed successfully.
   * 2. "CPF ou CNPJ Inválido." - Indicates that the CPF or CNPJ provided is
   * invalid.
   * 3.
   */
  async _start(LIMITER = 3) {
    if (!LIMITER) throw new Error("Portal fora do ar.");
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    let url =
      this._processmentType === "PF"
        ? configs.URLS.ISSUE.PF
        : configs.URLS.ISSUE.PJ;

    if (this._verifyAuthenticity) {
      url =
        this._processmentType === "PF"
          ? configs.URLS.AUTHENTICATE.PF
          : configs.URLS.AUTHENTICATE.PJ;
    }

    try {
      if (this._processmentType !== "PF" && this._processmentType !== "PJ") {
        return "CPF ou CNPJ Inválido.";
      }
      await this._robot.start(url, configs.BROWSER_OPTIONS);
      await this._robot.setDownloadPath(configs.DOWNLOAD_PATH);
      await this._robot.waitForSelector(documentNumberInput);
      await this._robot.delay(2000);
      return "Site da PGFN acessado com sucesso.";
    } catch (error) {
      await this._robot.close();
      return await this._start(--LIMITER);
    }
  }

  /**
   * This async function consults a document number, handles errors, waits for
   * loading, and retries a limited number of times.
   * @param [LIMITER=3] - The `LIMITER` parameter in the `_consultDocumentNumber`
   * function is used to limit the number of retries when encountering errors
   * during the document number consultation process. If the `LIMITER` reaches 0,
   * an error is thrown to indicate that there was an issue with consulting the CPF
   * or CNPJ
   * @returns The `_consultDocumentNumber` function is returning a promise that
   * resolves when the function completes its execution.
   */
  async _consultDocumentNumber(LIMITER = 3) {
    if (!LIMITER) throw new Error("Erro ao consultar CPF ou CNPJ.");

    try {
      await this.__insertDocumentNumber();
      await this._robot.delay(1000);
      await this.__consult();
      const { hasError, message } = await this.__handleDocumentNumberError();
      if (hasError) {
        LIMITER = 0;
        throw new Error(message);
      }
      await this.__handleNetError();
      await this.__waitForLoading();
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.close();
      await this._start(LIMITER - 1);
      return await this._consultDocumentNumber(--LIMITER);
    }
  }

  /**
   * This async function downloads a tax regularity certificate with a limit on the
   * number of retries.
   * @param [LIMITER=3] - The `LIMITER` parameter in the `async
   * _downloadTaxRegularityCertificate` function is used to control the number of
   * retries in case of errors during the process of downloading a tax regularity
   * certificate. It starts with a default value of 3 and decrements by 1 with each
   * retry attempt
   * @returns The `_downloadTaxRegularityCertificate` function is returning a
   * Promise that resolves to either the result of the successful download of a tax
   * regularity certificate in PDF format or an error message indicating that the
   * portal encountered issues while issuing the certificate.
   */
  async _downloadTaxRegularityCertificate(LIMITER = 3) {
    if (!LIMITER)
      throw new Error("O portal apresentou falhas ao emitir certidão.");
    const message = this._selectors.MESSAGES.RESULT_OF_CONSULT;

    try {
      await this.__reissueCertificate();
      await this.__waitForLoading();
      await this._robot.delay(1000);
      await this.__waitForResultOfConsult();
      const consultMessage = await this._robot.getElementInnerText(message);
      if (consultMessage.includes("certidão foi emitida com sucesso")) {
        await this._robot.verifyDownload(
          configs.DOWNLOAD_PATH,
          `${this._documentNumber}.pdf`
        );
      } else {
        LIMITER = 0;
        throw new Error(consultMessage);
      }
    } catch (error) {
      if (!LIMITER) throw new Error(error.message);
      await this._robot.close();
      await this._start(LIMITER - 1);
      await this._consultDocumentNumber(LIMITER - 1);
      return await this._downloadTaxRegularityCertificate(--LIMITER);
    }
  }

  /**
   * The _fillAuthenticityForm function fills out an authenticity form by inserting
   * document number, control code, date of issue, issue time, selecting type of
   * certificate, and consulting.
   * @param controlCode - The `controlCode` parameter is typically a unique code or
   * identifier used to verify the authenticity of a document or certificate. It is
   * often a combination of letters, numbers, or symbols that is specific to the
   * document in question.
   * @param dateOfIssue - The `dateOfIssue` parameter in the
   * `_fillAuthenticityForm` function represents the date on which the certificate
   * was issued. It is used as input to fill in the authenticity form for the
   * certificate.
   * @param issueTime - The `issueTime` parameter in the `_fillAuthenticityForm`
   * function likely represents the time at which the certificate was issued. This
   * information is important for verifying the authenticity of the certificate.
   * When calling the `_fillAuthenticityForm` function, you would provide the
   * specific time at which the
   * @param typeOfCertificate - Type of certificate is a string that specifies the
   * type of certificate being filled in the authenticity form. It could be
   * something like "Birth Certificate", "Marriage Certificate", "Degree
   * Certificate", etc.
   */
  async _fillAuthenticityForm(
    controlCode,
    dateOfIssue,
    issueTime,
    typeOfCertificate
  ) {
    await this.__insertDocumentNumber();
    await this.__insertControlCode(controlCode);
    await this.__insertDateOfIssue(dateOfIssue);
    await this.__insertIssueTime(issueTime);
    await this.__selectTypeOfCertificate(typeOfCertificate);
    await this.__consult();
  }

  /**
   * The function __insertDocumentNumber asynchronously sets a value in an input
   * field using a robot.
   */
  async __insertDocumentNumber() {
    const documentNumberInput = this._selectors.INPUTS.ID_CODE;
    await this._robot.setValue(this._documentNumber, documentNumberInput);
  }

  /**
   * The function __insertControlCode asynchronously sets a control code value in a
   * specified input field using a robot.
   * @param controlCode - The `controlCode` parameter is a value that represents a
   * control code that needs to be inserted into an input field on a webpage.
   */
  async __insertControlCode(controlCode) {
    const controlCodeInput = this._selectors.INPUTS.CONTROL_CODE;
    await this._robot.setValue(controlCode, controlCodeInput);
  }

  /**
   * The function __insertDateOfIssue asynchronously sets the value of a date input
   * field.
   * @param dateOfIssue - The `dateOfIssue` parameter is the date that you want to
   * insert into the date of issue input field on a web page.
   */
  async __insertDateOfIssue(dateOfIssue) {
    const dateOfIssueInput = this._selectors.INPUTS.DATE_OF_ISSUE;
    await this._robot.setValue(dateOfIssue, dateOfIssueInput);
  }

  /**
   * The function __insertIssueTime asynchronously sets the value of the issueTime
   * input field using a robot.
   * @param issueTime - The `issueTime` parameter is a value representing the time
   * of an issue. It is used as input to the `__insertIssueTime` function to set
   * the issue time in a specific input field on a webpage.
   */
  async __insertIssueTime(issueTime) {
    const issueTimeInput = this._selectors.INPUTS.ISSUE_TIME;
    await this._robot.setValue(issueTime, issueTimeInput);
  }

  /**
   * The function __selectTypeOfCertificate selects an option from a dropdown menu
   * based on the provided typeOfCertificate parameter.
   * @param typeOfCertificate - The `typeOfCertificate` parameter in the
   * `__selectTypeOfCertificate` function represents the type of certificate that
   * you want to select from a dropdown menu. This parameter is used to specify the
   * option that should be selected from the dropdown menu on the webpage.
   */
  async __selectTypeOfCertificate(typeOfCertificate) {
    const typeOfCertificateSelect = this._selectors.SELECTS.TYPE_OF_CERTIFICATE;
    await this._robot.selectOptionFromDropdown(
      typeOfCertificateSelect,
      typeOfCertificate
    );
  }

  /**
   * The async function __consult clicks on a consult button using a robot.
   */
  async __consult() {
    const consultButton = this._selectors.BUTTONS.CONSULT;
    await this._robot.click(consultButton);
  }

  /**
   * The function __handleNetError() attempts to handle network errors by refreshing
   * the page and recursively calling itself until the error is resolved.
   * @returns The `__handleNetError` function is returning the result of calling
   * itself recursively.
   */
  async __handleNetError() {
    const netError = this._selectors.MESSAGES.NET_ERROR;
    try {
      await this._robot.waitForSelector(netError, 1500);
      await this._robot.refreshPage();
      await this._robot.delay(1000);
      return await this.__handleNetError();
    } catch (error) {}
  }

  /**
   * This async function waits for the result of a consultation, handling
   * authenticity verification and timeout limits.
   * @param [LIMITER=60] - The `LIMITER` parameter in the
   * `__waitForResultOfConsult` function is used to limit the number of iterations
   * in the while loop. It starts with a default value of 60 and decrements by 1
   * with each recursive call to `__waitForResultOfConsult`. If the limit reaches
   * @returns The `__waitForResultOfConsult` function is recursively calling itself
   * with a decremented `LIMITER` until either a result is found or the `LIMITER`
   * reaches 0. If a result is found, it will return the result. If the `LIMITER`
   * reaches 0 without finding a result, it will throw an error indicating that the
   * portal is not responding.
   */
  async __waitForResultOfConsult(LIMITER = 60) {
    const resultOfConsultTitle = !this._verifyAuthenticity
      ? this._selectors.TITLES.RESULT_OF_CONSULT
      : this._selectors.TITLES.RESULT_OF_AUTHENTICITY;

    console.log("Aguardando resultado da consulta...");
    await this._robot.delay(1000);
    while (!(await this._robot.findElement(resultOfConsultTitle)) && LIMITER) {
      return await this.__waitForResultOfConsult(--LIMITER);
    }

    if (!LIMITER)
      throw new Error(
        "Portal não está respondendo. Tente novamente mais tarde."
      );
  }

  /**
   * The function __reissueCertificate asynchronously clicks a button to issue a
   * new certificate after waiting for the button to be available.
   */
  async __reissueCertificate() {
    const issueNewCertificateButton =
      this._selectors.BUTTONS.ISSUE_NEW_CERTIFICATE;
    try {
      await this._robot.waitForSelector(issueNewCertificateButton, 2000);
      await this._robot.delay(500);
      await this._robot.click(issueNewCertificateButton);
    } catch (error) {}
  }

  /**
   * The function __waitForLoading() waits for a loading element to finish loading
   * on a webpage.
   * @returns The function `__waitForLoading()` is returning a promise that
   * resolves when the loading indicator on the page is no longer present,
   * indicating that the page has finished loading.
   */
  async __waitForLoading() {
    const loading = this._selectors.LOADING;
    console.log("Aguardando página carregar...");
    await this._robot.delay(1000);
    const isLoading = await this._robot.getElementAttribute(loading, "class");
    if (isLoading === "loading") {
      return await this.__waitForLoading();
    }
    await this._robot.delay(500);
  }

  /**
   * This async function checks for errors related to a document number (CPF or
   * CNPJ) and returns an object indicating if there is an error and the error
   * message if applicable.
   * @returns The function `__handleDocumentNumberError` returns an object with two
   * properties:
   * - `hasError`: a boolean value indicating whether an error was found (true if
   * an error was found, false otherwise)
   * - `message`: a string containing the error message if an error was found, or
   * an empty string if no error was found
   */
  async __handleDocumentNumberError() {
    const errorModal = this._selectors.MODALS.ERROR;
    const errorMessage = this._selectors.MESSAGES.ERROR_MESSAGE;
    console.log("Verificando erros no CPF ou CNPJ...");
    await this._robot.delay(1500);
    if (await this._robot.findElement(errorModal)) {
      const styleMessage = await this._robot.getElementAttribute(
        errorModal,
        "style"
      );
      if (!styleMessage.includes("display: none;")) {
        const message = await this._robot.getElementText(errorMessage);
        return { hasError: true, message: message };
      }
    }
    return { hasError: false, message: "" };
  }

  /**
   * This async function retrieves the authenticity result from a table element
   * after waiting for a consultation result.
   * @returns the authenticity result from a table. It waits for the result of a
   * consultation, gets the text of the authenticity result element, splits the
   * text by new lines, filters out any empty items, and then returns the
   * third-to-last non-empty item after trimming it.
   */
  async _getAuthenticityResult() {
    const authenticityResult = this._selectors.TABLES.AUTHENTICITY_RESULT;
    await this.__waitForResultOfConsult();
    let result = await this._robot.getElementText(authenticityResult);
    result = result.split("\n").filter((item) => item.trim() !== "");
    return result[result.length - 3].trim();
  }

  /**
   * This JavaScript function confirms the authenticity of a tax regularity
   * certificate by filling a form, retrieving the result, and handling success or
   * failure cases.
   * @param controlCode - The `controlCode` parameter is a unique code or
   * identifier associated with the tax document being verified for authenticity.
   * It helps in tracking and identifying the specific document in question during
   * the authenticity verification process.
   * @param dateOfIssue - The `dateOfIssue` parameter in the
   * `confirmAuthenticityOfTaxRegularity` function represents the date on which the
   * tax certificate was issued. It is used as input to verify the authenticity of
   * the tax certificate.
   * @param issueTime - The `issueTime` parameter in the
   * `confirmAuthenticityOfTaxRegularity` function represents the time at which the
   * tax certificate was issued. It is used as part of the process to confirm the
   * authenticity of the tax certificate.
   * @param [typeOfCertificate=Negativa] - The `typeOfCertificate` parameter in the
   * `confirmAuthenticityOfTaxRegularity` function is a string parameter that
   * specifies the type of certificate being processed. In the provided code
   * snippet, the default value for `typeOfCertificate` is set to "Negativa". This
   * parameter is used when
   * @returns The `confirmAuthenticityOfTaxRegularity` function returns an object
   * `authenticityProcessmentReturn` containing information about the authenticity
   * processment result. The object includes the document number as the key and an
   * object with details such as control code, date of issue, issue time, status
   * (success or failure), error reason (if any), and observation (authenticity
   * result).
   */
  async confirmAuthenticityOfTaxRegularity(
    controlCode,
    dateOfIssue,
    issueTime,
    typeOfCertificate = "Negativa"
  ) {
    const authenticityProcessmentReturn = {};

    try {
      await this._start();
      await this._fillAuthenticityForm(
        controlCode,
        dateOfIssue,
        issueTime,
        typeOfCertificate
      );
      const authenticityResult = await this._getAuthenticityResult();

      if (authenticityResult.includes("não é autêntica"))
        throw new Error(authenticityResult);

      authenticityProcessmentReturn[this._documentNumber] = {
        codigo_controle: controlCode,
        data_emissao: dateOfIssue,
        hora_emissao: issueTime,
        status: "sucesso",
        motivo_erro: null,
        observacao: authenticityResult,
      };
    } catch (error) {
      authenticityProcessmentReturn[this._documentNumber] = {
        codigo_controle: controlCode,
        data_emissao: dateOfIssue,
        hora_emissao: issueTime,
        status: "falha",
        motivo_erro: error.message,
        observacao: null,
      };
    } finally {
      await this._robot.close();
      await this._robot.delay(500 * Math.floor(Math.random() * 5));
    }

    return authenticityProcessmentReturn;
  }

  /**
   * This async function generates a tax regularity certificate and returns an
   * object containing the document number, status, certificate URL, and error
   * message.
   * @returns The `generateTaxRegularityCertificate` function is returning an
   * object `documentNumberProcessmentReturn` which contains information about the
   * processing status of a tax regularity certificate generation for a specific
   * document number. The object includes the document number as a key and an
   * object with the following properties:
   */
  async generateTaxRegularityCertificate() {
    const documentNumberProcessmentReturn = {};

    const fileName = `Certidao-${this._documentNumber}.pdf`;
    console.log(this._documentNumber);

    try {
      await this._start();
      await this._consultDocumentNumber();
      await this._downloadTaxRegularityCertificate();
      await this._robot.delay(500);
      const s3FileUrl = await s3Client.uploadFile(
        fileName,
        path.resolve(String(configs.DOWNLOAD_PATH), fileName)
      );

      documentNumberProcessmentReturn[this._documentNumber] = {
        status: "sucesso",
        certidao: s3FileUrl,
        motivo_erro: null,
      };
    } catch (error) {
      const errorMessage = error.message
        .replace(/\n/g, "")
        .replace("Resultado da Consulta", "")
        .trim();

      documentNumberProcessmentReturn[this._documentNumber] = {
        status: "falha",
        certidao: null,
        motivo_erro: errorMessage,
      };
    } finally {
      await this._robot.close();
      await this._robot.delay(1000 * Math.floor(Math.random() * 5));
    }

    return documentNumberProcessmentReturn;
  }
}

module.exports = PGFN;
