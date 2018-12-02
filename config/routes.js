const controller = require('../controller');

module.exports = [
  ['GET', /^\/$/, controller.home],
  ['GET', /^\/api\/?$/, controller.api.rootAction],
  ['GET', /^\/api\/boxes\/?$/, controller.api.listBoxes],
  ['POST', /^\/api\/boxes\/?$/, controller.utils.checkJsonMimeType, controller.utils.checkJSONBody, controller.api.createBox],
  ['GET', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, controller.api.fetchBox],
  ['PUT', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, controller.utils.checkJsonMimeType, controller.utils.checkJSONBody, controller.api.createBox],
  ['GET', /^\/schemas\/(?<schema>\w+)\.json$/, controller.schema],
];
