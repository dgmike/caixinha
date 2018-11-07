const http = require('http');
const fs = require('fs');
const url = require('url');
const util = require('util');
const winston = require('winston');
const uuidv4 = require('uuid/v4');

const server = http.createServer();

class Controller {
  routes(req) {
    const routes = [
      ['GET', /^\/$/, this.home],
      ['GET', /^\/api\/?$/, this.api],
      ['GET', /^\/api\/boxes\/?$/, this.apiBoxes],
      ['GET', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, this.apiBox],
    ];

    const parsedUrl = url.parse(req.url, true)
    const { pathname  } = parsedUrl;
    const method = req.method.toUpperCase();

    return routes
      .filter(route => method === route[0].toUpperCase())
      .find(route => {
	const matches = pathname.match(route[1]);
	if (matches) {
	  route.params = matches.groups;
	  route.query = parsedUrl.query;
	  route.pathname = pathname;
	  return matches;
	}
      });
  }

  createLogger({ req, res }) {
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
	new winston.transports.Console(),
      ]
    });

    const loggerInstance = {};

    Object.keys(winston.config.npm.levels).forEach((level) => {
      loggerInstance[level] = (...args) => {
	const info = {};
	info.thread = req.thread;
	info.method = req.method;
	info.level = level;
	info.url = req.url;
	info.date = new Date().toJSON();

	if (args.length === 1 && typeof args[0] === "object") {
	  Object.assign(info, args[0]);
	  return logger[level].call(logger, info);
	}

	args = [ util.format(...args), info ];
	return logger[level].apply(logger, args);
      }
    });

    return loggerInstance;
  }

  logResponse({ logger, req, res }) {
    logger.info({ message: 'response', responseStatus: res.statusCode })
  }

  async home({ req, res }) {
    const page = await fs.readFileSync(`${__dirname}/templates/index.html`);
    res.writeHead(200);
    res.write(page.toString());
    res.end();
  }

  async api({ req, res }) {
    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
	self: { href: '/api' },
	boxes: { href: '/api/boxes'  },
      },
    }));
    res.end();
  }

  async apiBoxes({ req, res }) {
    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
	api: { href: '/api' },
	self: { href: '/api/boxes'  },
	box: { href: '/api/boxes/:boxId', templated: true  },
      },
      _embedded: {
	boxes: [], // TODO: populate
      },
    }));
    res.end();
  }

  async apiBox({ req, res }) {
    const info = url.parse(req.url, true);

    res.writeHead(200, { 'Content-Type': 'application/hal+json' });
    res.write(JSON.stringify({
      _links: {
	api: { href: '/api' },
	boxes: { href: '/api/boxes'  },
	self: { href: `/api/boxes/${req.params.boxId}` },
      },
      // TODO: populate attributes
    }));
    res.end();
  }
}

const controller = new Controller();

server.on('request', async (req, res) => {
  req.thread = uuidv4();
  const logger = controller.createLogger({ req, res });
  logger.info('received request');

  const route = controller.routes(req)

  if (route) {
    req.params = route.params;
    req.query = route.query;
    req.pathname = route.pathname;

    context = { req, res, logger };

    let promise = Promise.resolve();

    route.push(controller.logResponse);

    route.slice(2).forEach((action) => {
      promise.then(async () => {
	action(context);
	return;
      })
    });
    return;
  }

  res.statusCode = 404;
  res.end("");
  controller.logResponse(req, res);
});

server.listen(8000, () => {
  console.info('Listening 0.0.0.0:8000')
});
