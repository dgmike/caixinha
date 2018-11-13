const http = require('http');

function sendErrorJson(res, body, errors) {
  res.writeHead(422, { 'content-type': 'application/vnd.error+json' });
  const content = {
    message: http.STATUS_CODES[422],
    _embedded: {
      errors: errors.map((error) => {
        return {
          message: error.message,
          path: error.dataPath || '.',
        };
      }),
    },
    body,
    errors,
  };
  res.end(JSON.stringify(content));
}

module.exports = {
  sendErrorJson,
};