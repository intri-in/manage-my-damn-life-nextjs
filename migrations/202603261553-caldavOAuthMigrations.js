'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn("caldav_accounts", "refresh_token",{
                    type: Sequelize.DataTypes.STRING,
                    }, {transaction: t}),
                    queryInterface.addColumn("caldav_accounts", "access_token",{
                    type: Sequelize.DataTypes.STRING,
                    }, {transaction: t}),
                    queryInterface.addColumn("caldav_accounts", "client_id",{
                    type: Sequelize.DataTypes.STRING      
                    }, {transaction: t}),
                    queryInterface.addColumn("caldav_accounts", "provider",{
                    type: Sequelize.DataTypes.STRING,    
                    }, {transaction: t}),
            ]);
          });
      
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.removeColumn("caldav_accounts", "refresh_token",{transaction:t}),
                queryInterface.removeColumn("caldav_accounts", "access_token",{transaction:t}),
                queryInterface.removeColumn("caldav_accounts", "client_id",{transaction:t}),
                queryInterface.removeColumn("caldav_accounts", "provider",{transaction:t}),
              
            ])
        })
    }
}