const path = require('path');
const fs = require('fs');
const api = require('./api');

async function home({ res }) {
  const page = fs.readFileSync(`${__dirname}/../templates/index.html`);
  res.writeHead(200);
  res.write(page.toString());
  res.end();
}

async function schema({ req, res }) {
  const filename = path.resolve(`${__dirname}/../schema/${req.params.schema}.json`);
  const fileExists = fs.existsSync(filename);

  if (!fileExists) {
    res.writeHead(404);
    res.end();
    return;
  }

  const schemaContent = await fs.readFileSync(filename).toString();

  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(schemaContent);
}

module.exports = {
  home,
  schema,
  api,
};
