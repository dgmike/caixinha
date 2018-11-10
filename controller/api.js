const jsonBodyParser = require('body/json');
const util = require('util');
const Ajv = require('ajv');

const createBoxSchema = {
  $id: '/schemas/createBoxSchema.json',
  title: 'Box',
  description: 'A box where notes are added',
  type: 'object',
  required: ['title', 'intentToFinishOn', 'status'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      description: 'Title of box',
      default: '',
    },
    intentToFinishOn: {
      type: 'string',
      description: 'When the box is intented to close',
      format: 'date-time',
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive'],
      default: 'inactive',
      description: 'Status of box',
    },
  },
};

const ajv = new Ajv({
  allErrors: true,
  schemas: [createBoxSchema],
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
  await locals.db.model('box').create({
    title: `Meu titulo ${new Date().toISOString()}`,
  });
  const boxResult = await locals.db.model('box').findAll();

  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify({
    _links: {
      api: { href: '/api' },
      self: { href: '/api/boxes' },
      box: { href: '/api/boxes/:boxId', templated: true },
    },
    _embedded: {
      boxes: boxResult.map(boxItem => boxItem.toJSON()),
    },
  }));
  res.end();
}

async function fetchBox({ req, res }) {
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

  // TODO: validate
  const createBoxValidate = ajv.getSchema('/schemas/createBoxSchema.json');
  const valid = createBoxValidate(body);
  if (!valid) {
    res.setHeader('content-type', 'application/vnd.error+json');
    res.writeHead(422);
    res.write(JSON.stringify({
      body,
      errors: createBoxValidate.errors,
    }));
    res.end();
    return;
  }

  // TODO: write values
  res.writeHead(200, { 'Content-Type': 'application/hal+json' });
  res.write(JSON.stringify(body));
  res.end();
}

module.exports = {
  rootAction,
  listBoxes,
  fetchBox,
  createBox,
};
