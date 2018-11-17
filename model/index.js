/* eslint-disable func-names, no-underscore-dangle */

const Sequelize = require('sequelize');

module.exports = async (db) => {
  const boxModel = db.define('box', {
    title: Sequelize.STRING,
    intentToFinishOn: Sequelize.DATE,
    status: Sequelize.ENUM('active', 'inactive'),
  });

  boxModel.prototype.representOne = function () {
    const represent = this.toJSON();
    represent._links = {
      self: `/api/boxes/${this.get('id')}`,
      boxes: '/api/boxes',
      api: '/api/api',
    };
    return represent;
  };

  return db;
};
