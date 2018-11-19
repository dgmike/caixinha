const jsonBodyParser = require('body/json');
const util = require('util');
const Ajv = require('ajv');
const schema = require('../schema');
const utils = require('../utils');

const ajv = new Ajv({
  allErrors: true,
  errorDataPath: 'property',
  jsonPointers: true,
  schemas: Object.values(schema),
});

const jsonBody = util.promisify(jsonBodyParser);

async function rootAction({ res }) {
  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify({
    _links: {
      self: { href: '/api' },
      boxes: { href: '/api/boxes' },
    },
  }));
  res.end();
}

async function listBoxes({ res, locals }) {
  const boxResult = await locals.db.model('box').findAll({
    attributes: ['id', 'title'],
  });

  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify({
    _links: {
      api: { href: '/api' },
      self: { href: '/api/boxes' },
      box: { href: '/api/boxes/:boxId', templated: true },
    },
    _embedded: {
      boxes: boxResult.map(boxItem => boxItem.representOne()),
    },
  }));
  res.end();
}

async function fetchBox({ req, res, locals }) {
  let boxResult;

  try {
    boxResult = await locals.db.model('box').find({
      where: {
        id: req.params.boxId,
      },
    });
  } catch (err) {
    throw err;
  }

  if (!boxResult) {
    res.writeHead(404);
    res.end();
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify(boxResult.representOne()));
  res.end();
}

async function createBox({ req, res, locals }) {
  if (!(req.headers['content-type'] || '').match(/application\/([a-z0-9_.-]+)?json/)) {
    res.writeHead(415);
    res.end();
    return;
  }

  let body;

  try {
    body = await jsonBody(req);
  } catch (e) {
    res.setHeader('content-type', 'application/vnd.error+json');
    res.writeHead(422);
    res.write(JSON.stringify({
      message: 'Invalid json body',
    }));
    res.end();
    throw e;
  }

  const createBoxValidate = ajv.getSchema('/schemas/createBoxSchema.json');
  const valid = createBoxValidate(body);

  if (!valid) {
    utils.sendErrorJson({
      res,
      body,
      errors: utils.formatSchemaErrors(createBoxValidate.errors),
    });
    return;
  }

  let result;

  try {
    result = await locals.db.model('box').create(body);
  } catch (err) {
    throw err;
  }

  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify(result.representOne()));
  res.end();
}

module.exports = {
  rootAction,
  listBoxes,
  fetchBox,
  createBox,
};
