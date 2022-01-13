const { resolve } = require("path");
const { readFileSync } = require("fs");
const { parse } = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");

const { homepage } = require(resolve(__dirname, "../package.json"));
const serverEnvFile = readFileSync(resolve(__dirname, "../../server/.env"), "utf8");
const { API_PORT } = parse(serverEnvFile);

module.exports = function (app) {
  app.use(
    `${homepage}/api`,
    createProxyMiddleware({
      target: `http://localhost:${API_PORT}`,
      changeOrigin: true,
      pathRewrite: {
        [`^${homepage}/api`]: "/api",
      },
    }),
  );
};
