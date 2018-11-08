const http = require('http');
const uuidv4 = require('uuid/v4');
const { winstonLogger, createLogger, logResponse } = require('./logger');
const { defineRoutes, router } = require('./router');

function createServer(routes) {
  const server = http.createServer();
  defineRoutes(routes);

  server.on('request', async (req, res) => {
    req.thread = uuidv4();
    const logger = createLogger({ req, res });
    logger.info('received request');

    const route = router(req);

    const context = { req, res, logger };

    if (route) {
      req.params = route.params;
      req.query = route.query;
      req.pathname = route.pathname;

      let promise = Promise.resolve();

      route.slice(2).forEach((action) => {
        promise = promise.then(action.bind(null, context));
      });

      promise
        .catch((err) => {
          logger.warn({
            message: 'Internal server error',
            err: err.toString(),
            trace: err.stack,
          });
          context.res.writeHead(500);
          context.res.end();
        })
        .finally(() => { logResponse(context); });

      return;
    }

    context.res.writeHead(404);
    context.res.end();
    logResponse(context);
  });

  return server;
}

function run(server) {
  server.listen(8000, () => {
    winstonLogger.info('Listening 0.0.0.0:8000');
  });
}

module.exports = {
  createServer,
  run,
};
