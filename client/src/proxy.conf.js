require("dotenv").config({
  path: require("path").resolve(__dirname, "../../database/.env"),
});

module.exports = {
  "/api": {
    target: `http://localhost:${process.env.API_PORT || 9000}`,
    secure: false,
    logLevel: "debug",
  },
};
