'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
            queryInterface.createTable('webcal_events', {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true },
                webcal_accounts_id: { type: Sequelize.STRING},
                data: {
                type: Sequelize.STRING(5000),
                allowNull: true
                },
            }, {transaction: t}),
            ]);
          });
      
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
              queryInterface.dropTable('webcal_events',{transaction:t}),

              
            ])
        })
    }
}