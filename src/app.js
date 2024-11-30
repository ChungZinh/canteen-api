const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { default: helmet } = require("helmet");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const app = express();

// middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// database
require("./db/init.mongodb");

// cron jobs
require("./cron");

//swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(require("./swagger/swaggerConfig"))
);

// routes
app.use("", require("./routes"));

// error handling
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: "error",
    code: error.status || 500,
    message: error.message || "INTERNAL_SERVER_ERROR",
  });
});


module.exports = app;