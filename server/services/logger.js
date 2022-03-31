const util = require("util");
const { createLogger, format, transports } = require("winston");

function formatLog({ label, timestamp, level, message }) {
  const metadata = [label, process.pid, timestamp, level].map((s) => `[${s}]`);
  return [...metadata, util.format(message)].join(" ");
}

/**
 * Returns a winston logger using the specified label and configuration
 * @param {string} name
 * @param {object} config
 * @returns Logger
 */
function getLogger(name = "app", config = {}, formatter = formatLog) {
  return new createLogger({
    level: config.level || "info",
    format: format.combine(
      format.timestamp({ format: "isoDateTime" }),
      format.label({ label: name }),
      format.printf(formatter),
    ),
    transports: [new transports.Console()],
    exitOnError: false,
  });
}

module.exports = { formatLog, getLogger };
