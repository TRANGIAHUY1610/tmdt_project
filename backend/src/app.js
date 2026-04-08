const express = require("express");
const cors = require("cors");
const path = require("path");

const requestLogger = require("./middlewares/requestLogger");
const notFoundApi = require("./middlewares/notFoundApi");
const errorHandler = require("./middlewares/errorHandler");
const apiRoutes = require("./routes/api");

const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api", apiRoutes);

  app.use(express.static(FRONTEND_DIR));

  app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    return res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  app.use("/api/*", notFoundApi);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
