const express = require("express");
const sqlite = require("better-sqlite3");
const { validateEnvironment } = require("./services/environment");
const { logRequests, logErrors } = require("./services/middleware");
const { getLogger } = require("./services/logger");
const { forkCluster } = require("./services/cluster");
const { api } = require("./services/api");
const { APP_NAME, API_PORT, DATABASE_PATH, LOG_FOLDER, LOG_LEVEL } = process.env;

// ensure that all environment variables are set
validateEnvironment();

// if in master process, fork and return
if (forkCluster()) return;

// if in child process, create express application
const app = express();

// if behind a proxy, use the first x-forwarded-for address as the client's ip address
app.set("trust proxy", true);
app.set("json spaces", 2);
app.set("x-powered-by", false);

// register services as app locals
app.locals.logger = getLogger(APP_NAME, { folder: LOG_FOLDER, level: LOG_LEVEL });
app.locals.database = sqlite(DATABASE_PATH);

// register middleware
app.use(logRequests());
app.use("/api", api);
app.use(logErrors());

// start app on specified port
app.listen(API_PORT, () => {
  app.locals.logger.info(`${APP_NAME} started on port ${API_PORT}`);
});

module.exports = app;
