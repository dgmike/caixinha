const jsonBodyParser = require('body/json');
const util = require('util');

const jsonBody = util.promisify(jsonBodyParser);

async function root({ res }) {
  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify({
    _links: {
      self: { href: '/api' },
      boxes: { href: '/api/boxes' },
    },
  }));
  res.end();
}

async function boxes({ res }) {
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

async function box({ req, res }) {
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

async function createBox({ req, res }) {
  const body = await jsonBody(req);

  // TODO: validate
  // TODO: write values
  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify(body));
  res.end();
}

module.exports = {
  root,
  boxes,
  box,
  createBox,
};
