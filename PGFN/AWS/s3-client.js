const AWS = require("aws-sdk");
const fs = require("fs");

/**
 * The function `uploadFile` uploads a file to an AWS S3 bucket and returns the
 * file's location.
 * @param fileName - The `fileName` parameter is the name you want to give to the
 * file when uploading it to the AWS S3 bucket. It should be a string representing
 * the desired name of the file in the bucket.
 * @param filePath - The `filePath` parameter in the `uploadFile` function refers
 * to the path of the file that you want to upload to an AWS S3 bucket. It should
 * be a string that specifies the location of the file on your local filesystem.
 * For example, it could be something like "/path/to/
 * @param mimeType - The `mimeType` parameter typically refers to the type of media
 * file being uploaded, such as "image/jpeg" for JPEG images or "application/pdf"
 * for PDF files. It helps define the type of content being uploaded and can be
 * used by the receiving end to interpret the file correctly.
 * @returns The function `uploadFile` returns the location of the uploaded file in
 * the AWS S3 bucket after successfully uploading the file.
 */
async function uploadFile(fileName, filePath, mimeType) {
  const s3 = new AWS.S3({
    apiVersion: "2012-10-17",
    region: process.env.AWS_REGION,
  });
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileContent,
  };

  const data = await s3.upload(params).promise();
  return data.Location;
}

module.exports = { uploadFile };
