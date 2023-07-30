'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([

        queryInterface.addColumn("users", "id",{
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
      
        },
        {transaction: t}),
        queryInterface.addColumn("users", "expires",{
          type: Sequelize.DataTypes.DATE,     
        }, {transaction: t}),
        queryInterface.addColumn("users", "session_token",{
          type: Sequelize.DataTypes.STRING,
          unique: "sessionToken",
        }, {transaction: t}),
        queryInterface.addColumn("users", "name",{
          type: Sequelize.DataTypes.STRING      
        }, {transaction: t}),
        queryInterface.addColumn("users", "email_verified",{
          type: Sequelize.DataTypes.STRING,    
        }, {transaction: t}),
        queryInterface.addColumn("users", "image",{
          type: Sequelize.DataTypes.STRING,       
        }, {transaction: t}),

        


      ]);
    });
},

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("users", "id",{transaction:t}),
        queryInterface.removeColumn("users", "session_token",{transaction:t}),
        queryInterface.removeColumn("users", "expires",{transaction:t}),
        queryInterface.removeColumn("users", "name",{transaction:t}),
        queryInterface.removeColumn("users", "email_verified",{transaction:t}),
        queryInterface.removeColumn("users", "image",{transaction:t})

        
      ])
  })

  }
};
