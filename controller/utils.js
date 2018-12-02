async function checkJsonMimeType({ req, res }) {
  if (!(req.headers['content-type'] || '').match(/application\/([a-z0-9_.-]+)?json/)) {
    res.writeHead(415);
    res.end();
    throw new Error('Invalid Mimetype');
  }
}

module.exports = {
  checkJsonMimeType,
};
