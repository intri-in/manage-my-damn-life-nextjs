'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
               await queryInterface.changeColumn("calendars", "url",{    
                        type: Sequelize.STRING(300),
                        allowNull: true
                })

                await queryInterface.changeColumn("calendars", "ctag",{    
                        type: Sequelize.STRING(300),
                        allowNull: true
                })

                await queryInterface.changeColumn("calendars", "description",{    
                        type: Sequelize.STRING(1000),
                        allowNull: true
                })
                await queryInterface.changeColumn("calendars", "syncToken",{    
                        type: Sequelize.STRING(300),
                        allowNull: true
                })
            }
        )


    },
    async down(queryInterface, Sequelize) {

        return queryInterface.sequelize.transaction(async t => {
            await queryInterface.changeColumn("calendars", "url",{    
                        type: Sequelize.STRING(200),
                        allowNull: true
                })
            await queryInterface.changeColumn("calendars", "ctag",{    
                        type: Sequelize.STRING(200),
                        allowNull: true
                })
            await queryInterface.changeColumn("calendars", "description",{    
                        type: Sequelize.STRING(45),
                        allowNull: true
                })
            await queryInterface.changeColumn("calendars", "syncToken",{    
                        type: Sequelize.STRING(200),
                        allowNull: true
            })
        })
    }
}