const { createServer, run } = require('./server');
const config = require('./config');

const server = createServer(config.routes);

run(server);
