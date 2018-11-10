const Sequelize = require('sequelize');
const { createServer, run } = require('./server');
const config = require('./config');
const modelSetup = require('./model');

const db = new Sequelize(config.database);
modelSetup(db)
  .then(async () => { await db.sync(); })
  .then(() => {
    const server = createServer(config.routes, { db });
    run(server);
  });
