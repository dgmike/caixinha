const http = require('http');

function sendErrorJson({
  res,
  errors,
  statusCode = 422,
}) {
  res.writeHead(422, { 'content-type': 'application/vnd.error+json' });
  const content = {
    message: http.STATUS_CODES[statusCode],
    total: errors.length,
    _embedded: { errors },
  };
  res.end(JSON.stringify(content));
}

function formatSchemaErrors(errors) {
  return errors.map(error => ({
    message: error.message,
    path: error.dataPath,
    logref: error.keyword,
    params: error.params,
  }));
}

module.exports = {
  sendErrorJson,
  formatSchemaErrors,
};
