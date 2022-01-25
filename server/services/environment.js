const environmentVariables = ["APP_NAME", "API_PORT", "DATABASE_PATH"];

function validateEnvironment() {
  for (const key of environmentVariables) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}.`);
    }
  }
}

module.exports = { validateEnvironment };
