const winston = require("winston");
import { BasicLogger, Logger, Data } from "./@types";

export function getLogger(level: keyof BasicLogger): BasicLogger {
  return new winston.createLogger({
    transports: [
      new winston.transports.Console({
        level,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        stderrLevels: ["error"],
      }),
    ],
  });
}

/**
 * Sets default logger's level to given level.
 * @param   {BasicLogger} logger - Logger object (default type)
 * @param   {string} level  - Log level.
 * @returns {void}
 * @private
 */
export function setLogLevel(logger: Logger, level: keyof BasicLogger): void {
  logger.transports[0].level = level;
}

/**
 * Returns default logger's level.
 * @param   {BasicLogger} logger - Logger object (default type)
 * @returns {string}        - Log level.
 * @private
 */
export function getLogLevel(logger: Logger): keyof BasicLogger {
  return logger.transports[0].level;
}

export const stubLogger: BasicLogger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  verbose: () => {},
  silly: () => {},
};
