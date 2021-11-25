const express = require("express");
const sqlite = require("better-sqlite3");
const { logRequests, logErrors } = require("./services/middleware");
const { getLogger } = require("./services/logger");
const { forkCluster } = require("./services/cluster");
const { api } = require("./services/api");
const { name, port, logs, database } = require("./config");

// if in master process, fork and return
if (forkCluster()) return;

// if in child process, create express application
const app = express();

// if behind a proxy, use the first x-forwarded-for address as the client's ip address
app.set("trust proxy", true);

// register services as app locals
app.locals.logger = getLogger(name, logs);
app.locals.database = sqlite(database);

// register middleware
app.use(logRequests());
app.use("/api", api);
app.use(logErrors());

// start app on specified port
app.listen(port, () => {
  app.locals.logger.info(`${name} started on port ${port}`);
});

module.exports = app;
