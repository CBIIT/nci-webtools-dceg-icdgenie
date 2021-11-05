const config = require("../../database/config.json");

module.exports = {
  "/api": {
    target: `http://localhost:${config?.port || 9000}`,
    secure: false,
    logLevel: "debug",
  },
};
