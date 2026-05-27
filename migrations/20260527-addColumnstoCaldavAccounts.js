'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("caldav_accounts", "expires_in",{
                    type: Sequelize.DataTypes.STRING,
                    }, {transaction: t}),
                    queryInterface.addColumn("caldav_accounts", "last_updated",{
                    type: Sequelize.DataTypes.STRING,
                    }, {transaction: t}),
            ]);
          });
      
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.removeColumn("caldav_accounts", "expires_in",{transaction:t}),
                queryInterface.removeColumn("caldav_accounts", "last_updated",{transaction:t}),
              
            ])
        })
    }
}