'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: { type: Sequelize.STRING, allowNull: false },
      provider: { type: Sequelize.STRING, allowNull: false },
      provider_account_id: { type: Sequelize.STRING, allowNull: false },
      refresh_token: { type: Sequelize.TEXT },
      access_token: { type: Sequelize.TEXT },
      expires_at: { type: Sequelize.INTEGER },
      token_type: { type: Sequelize.STRING },
      scope: { type: Sequelize.STRING },
      id_token: { type: Sequelize.TEXT },
      session_state: { type: Sequelize.STRING },
      user_id: { type: Sequelize.UUID },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')

      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accounts');
  }
};