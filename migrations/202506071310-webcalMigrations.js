'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
            queryInterface.createTable('webcal_accounts', {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true },
                userid: { type: Sequelize.STRING},
                name: { type: Sequelize.STRING(100)},
                link: { type: Sequelize.STRING(1000),},
                colour:{ type: Sequelize.STRING(100)},
                updateInterval: { type: Sequelize.STRING(100),},
                lastFetched: {type: Sequelize.STRING(1000)}
            }, {transaction: t}),
            ]);
          });
      
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
              queryInterface.dropTable('webcal_accounts',{transaction:t}),

              
            ])
        })
    }
}