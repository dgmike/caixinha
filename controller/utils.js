const jsonBodyParser = require('body/json');
const util = require('util');

const jsonBody = util.promisify(jsonBodyParser);

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

module.exports = {
  checkJsonMimeType,
  checkJSONBody,
};
