const Ajv = require('ajv');
const schema = require('../schema');
const utils = require('../utils');

const ajv = new Ajv({
  allErrors: true,
  errorDataPath: 'property',
  jsonPointers: true,
  schemas: Object.values(schema),
});

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
  const body = req.jsonBody;
  const createBoxValidate = ajv.getSchema('/schemas/createBoxSchema.json');

  if (!createBoxValidate(body)) {
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

async function updateBox({ req, res, locals }) {
  const body = req.jsonBody;
  const updateBoxValidate = ajv.getSchema('/schemas/updateBoxSchema.json');

  if (!updateBoxValidate(body)) {
    utils.sendErrorJson({
      res,
      body,
      errors: utils.formatSchemaErrors(updateBoxValidate.errors),
    });
    return;
  }

  let result;

  try {
    result = await locals.db.model('box')
      .update(
        {
          where: {
            id: req.params.boxId,
          },
        },
        body,
      );
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
  updateBox,
};
