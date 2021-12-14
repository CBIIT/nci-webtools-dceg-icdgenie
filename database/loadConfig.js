const fs = require("fs");

if (fs.existsSync("./config.json")) {
  module.exports = require("./config.json");
} else {
  module.exports = {
    name: process.env.APP_NAME,
    port: process.env.API_PORT,
    database: process.env.DATABASE_PATH,
    logs: {
      folder: process.env.LOG_FOLDER,
      level: process.env.LOG_LEVEL,
    },
  };
}
