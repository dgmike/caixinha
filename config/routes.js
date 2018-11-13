const controller = require('../controller');

module.exports = [
  ['GET', /^\/$/, controller.home],
  ['GET', /^\/api\/?$/, controller.api.rootAction],
  ['GET', /^\/api\/boxes\/?$/, controller.api.listBoxes],
  ['POST', /^\/api\/boxes\/?$/, controller.api.createBox],
  ['GET', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, controller.api.fetchBox],
  ['GET', /^\/schemas\/(?<schema>\w+)\.json$/, controller.schema],
];
