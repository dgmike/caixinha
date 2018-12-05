const utils = require('../utils');

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

  let result;

  try {
    const item = await locals.db.model('box').findOne({ where: { id: req.params.boxId } });
    if (!item) {
      utils.sendErrorJson({ res, statusCode: 404 });
      throw new Error('Resource not found');
    }

    result = await item.update(
      body,
      {
        where: {
          id: req.params.boxId,
        },
      },
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
