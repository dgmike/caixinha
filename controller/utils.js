const jsonBodyParser = require('body/json');
const util = require('util');
const Ajv = require('ajv');

const schema = require('../schema');
const utils = require('../utils');

const jsonBody = util.promisify(jsonBodyParser);

const ajv = new Ajv({
  allErrors: true,
  errorDataPath: 'property',
  jsonPointers: true,
  schemas: Object.values(schema),
});

async function checkJsonMimeType({ req, res }) {
  if (!(req.headers['content-type'] || '').match(/application\/([a-z0-9_.-]+)?json/)) {
    res.writeHead(415);
    res.end();
    throw new Error('Invalid Mimetype');
  }
}

async function checkJSONBody({ req, res }) {
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

  req.jsonBody = body;
}

function validateSchema(schemaName) {
  return async function validateSchemaInstance({ req, res }) {
    const body = req.jsonBody;
    const createBoxValidate = ajv.getSchema(`/schemas/${schemaName}.json`);

    if (!createBoxValidate) {
      throw new Error(`Invalid schemaName: ${schemaName}`);
    }

    if (!createBoxValidate(body)) {
      utils.sendErrorJson({
        res,
        body,
        errors: utils.formatSchemaErrors(createBoxValidate.errors),
      });
      throw new Error('Invalid body');
    }
  }
}

module.exports = {
  checkJsonMimeType,
  checkJSONBody,
  validateSchema,
};
