const Sequelize = require('sequelize');

module.exports = async (db) => {
  db.define('box', {
    title: Sequelize.STRING,
    intentToFinishOn: Sequelize.DATE,
    status: Sequelize.ENUM('active', 'inactive'),
  });

  return db;
};
