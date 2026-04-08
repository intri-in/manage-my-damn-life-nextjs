'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
               await queryInterface.changeColumn("calendar_events", "data",{    
                type: Sequelize.STRING(10000),   
                        allowNull: true
                })
            }
        )

    },
    async down(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
               await queryInterface.changeColumn("calendar_events", "data",{    
                type: Sequelize.STRING(5000),   
                        allowNull: true
                })
            }
        )    
    }
}