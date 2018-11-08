const fs = require('fs');
const api = require('./api');

async function home({ res }) {
  const page = fs.readFileSync(`${__dirname}/../templates/index.html`);
  res.writeHead(200);
  res.write(page.toString());
  res.end();
}

module.exports = {
  home,
  api,
};
