const express = require("express");
const { swaggerUi, specs } = require("./configs/swagger-config");
const generateCertificateRoute = require("./routes/generate-certificates.js");
const confirmAuthenticityRoute = require("./routes/confirm-authenticity.js");

const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

generateCertificateRoute(app);
confirmAuthenticityRoute(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
