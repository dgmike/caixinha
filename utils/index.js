const http = require('http');

function sendErrorJson({
  res,
  errors,
  statusCode = 422,
}) {
  res.writeHead(statusCode, { 'content-type': 'application/vnd.error+json' });
  const content = {
    message: http.STATUS_CODES[statusCode],
  };

  if (errors) {
    // eslint-disable-next-line no-underscore-dangle
    content._embedded = { errors };
    content.total = errors.length;

  }

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
