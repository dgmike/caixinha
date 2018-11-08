const controller = require('../controller');

module.exports = [
  ['GET', /^\/$/, controller.home],
  ['GET', /^\/api\/?$/, controller.api.root],
  ['GET', /^\/api\/boxes\/?$/, controller.api.boxes],
  ['POST', /^\/api\/boxes\/?$/, controller.api.createBox],
  ['GET', /^\/api\/boxes\/(?<boxId>\d+)\/?$/, controller.api.box],
];
