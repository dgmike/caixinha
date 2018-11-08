const winston = require('winston');
const util = require('util');

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

function createLogger({ req }) {
  const loggerInstance = {};

  Object.keys(winston.config.npm.levels).forEach((level) => {
    loggerInstance[level] = (...args) => {
      const info = {};
      info.thread = req.thread;
      info.method = req.method;
      info.level = level;
      info.url = req.url;
      info.date = new Date().toJSON();

      if (args.length === 1 && typeof args[0] === 'object') {
        Object.assign(info, args[0]);
        return winstonLogger[level].call(winstonLogger, info);
      }

      return winstonLogger[level](...[util.format(...args), info]);
    };
  });

  return loggerInstance;
}

function logResponse({ logger, res }) {
  logger.info({ message: 'response', responseStatus: (res && res.statusCode) });
}

module.exports = {
  createLogger,
  logResponse,
  winstonLogger,
};
