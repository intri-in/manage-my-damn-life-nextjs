'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('calendars', 'description', {
      type: Sequelize.STRING(1000),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('calendars', 'description', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
  },
};
