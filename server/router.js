const url = require('url');

let routes;

function defineRoutes(newRoutes) {
  routes = newRoutes;
}

function router(req) {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method.toUpperCase();

  return routes
    .filter(route => method === route[0].toUpperCase())
    .find((route) => {
      const matches = pathname.match(route[1]);
      if (matches) {
        Object.assign(route, { params: matches.groups, query: parsedUrl.query, pathname });
      }
      return matches;
    });
}

module.exports = { router, defineRoutes };
