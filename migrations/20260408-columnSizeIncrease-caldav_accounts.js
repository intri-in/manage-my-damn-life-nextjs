'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
               await queryInterface.changeColumn("caldav_accounts", "username",{    
                        type: Sequelize.STRING(300),
                        allowNull: true
                })

        })
    },
    async down(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
            await queryInterface.changeColumn("caldav_accounts", "username",{    
                        type: Sequelize.STRING(45),
                        allowNull: true
            })
        })
    }
}
