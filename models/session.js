'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // define association here
    }
  }
  Session.init({
    id: DataTypes.UUID,
    expires:DataTypes.DATE,
    timestamp: DataTypes.DATE,
    session_token: DataTypes.STRING,
    user_id: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'session',
  });
  return Session;
};