'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static belongsTo(models){

    }
  }
  Account.init({
    id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    type: DataTypes.STRING,
    provider: DataTypes.STRING,
    provider_account_id: DataTypes.STRING,
    providerAccountId:  DataTypes.STRING,
    refresh_token: DataTypes.TEXT,
    access_token: DataTypes.TEXT,
    expires_at: DataTypes.NUMBER,
    token_type: DataTypes.STRING,
    scope: DataTypes.STRING,
    id_token: DataTypes.TEXT,
    session_state: DataTypes.STRING,
    createdAt:DataTypes.DATE,
    updatedAt:DataTypes.DATE,
    userId: DataTypes.UUID 
  }, {
    sequelize,
    modelName: 'account',
  });
  return Account;
};