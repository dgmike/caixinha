const http = require('http');
const fs = require('fs');
const url = require('url');
const util = require('util');
const winston = require('winston');
const uuidv4 = require('uuid/v4');

const server = http.createServer();

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});


class Controller {
  static routes(req) {
    const routes = [
      ['GET', /^\/$/, Controller.home],
      ['GET', /^\/api\/?$/, Controller.api],
      ['GET', /^\/api\/boxes\/?$/, Controller.apiBoxes],
      ['GET', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, Controller.apiBox],
    ];

    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;
    const method = req.method.toUpperCase();

    return routes
      .filter(route => method === route[0].toUpperCase())
      .find((route) => {
        const matches = pathname.match(route[1]);
        if (matches) {
          Object.assign(route, { params: matches.groups, query: parsedUrl.query, pathname });
        }
        return matches;
      });
  }

  static createLogger({ req }) {
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

  static logResponse({ logger, res }) {
    logger.info({ message: 'response', responseStatus: res.statusCode });
  }

  static async home({ res }) {
    const page = await fs.readFileSync(`${__dirname}/templates/index.html`);
    res.writeHead(200);
    res.write(page.toString());
    res.end();
  }

  static async api({ res }) {
    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
        self: { href: '/api' },
        boxes: { href: '/api/boxes' },
      },
    }));
    res.end();
  }

  static async apiBoxes({ res }) {
    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
        api: { href: '/api' },
        self: { href: '/api/boxes' },
        box: { href: '/api/boxes/:boxId', templated: true },
      },
      _embedded: {
        boxes: [], // TODO: populate
      },
    }));
    res.end();
  }

  static async apiBox({ req, res }) {
    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
        api: { href: '/api' },
        boxes: { href: '/api/boxes' },
        self: { href: `/api/boxes/${req.params.boxId}` },
      },
      // TODO: populate attributes
    }));
    res.end();
  }
}

server.on('request', async (req, res) => {
  req.thread = uuidv4();
  const logger = Controller.createLogger({ req, res });
  logger.info('received request');

  const route = Controller.routes(req);

  if (route) {
    req.params = route.params;
    req.query = route.query;
    req.pathname = route.pathname;

    const context = { req, res, logger };

    const promise = Promise.resolve();

    route.push(Controller.logResponse);

    route.slice(2).forEach((action) => {
      promise.then(async () => {
        action(context);
      });
    });
    return;
  }

  res.statusCode = 404;
  res.end('');
  Controller.logResponse(req, res);
});

server.listen(8000, () => {
  winstonLogger.info('Listening 0.0.0.0:8000');
});
