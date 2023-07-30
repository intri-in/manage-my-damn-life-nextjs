'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      users_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      created: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      level: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userhash: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      mobile: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
  
    });

    await queryInterface.createTable('caldav_accounts', {
      caldav_accounts_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(3000),
        allowNull: true
      },
      url: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      authMethod: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
  
    })

    await queryInterface.createTable('calendar_events', {
      calendar_events_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      url: {
        type: Sequelize.STRING(3000),
        allowNull: true
      },
      etag: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      data: {
        type: Sequelize.STRING(5000),
        allowNull: true
      },
      updated: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      type: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      calendar_id: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      deleted: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
  
    })

    await queryInterface.createTable('calendars', {
      calendars_id: {
        autoIncrement: true,
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      displayName: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      url: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      ctag: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      calendarColor: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      syncToken: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      reports: {
        type: Sequelize.STRING(2000),
        allowNull: true
      },
      resourcetype: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      caldav_accounts_id: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      updated: {
        type: Sequelize.STRING(45),
        allowNull: true
      }  
    })

    await queryInterface.createTable('custom_filters', {
      custom_filters_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      filtervalue: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
  
    })

    await queryInterface.createTable('labels', {
      labels_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      colour: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      }  
    })

    await queryInterface.createTable('otp_table', {
      otp_table_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      otp: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      created: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      type: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      reqid: {
        type: Sequelize.STRING(2000),
        allowNull: true
      }
  
    })

    await queryInterface.createTable('settings', {
      settings_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      global: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      value: {
        type: Sequelize.STRING(1000),
        allowNull: true
      }
  
    })

    await queryInterface.createTable('ssid_table', {
      ssid_table_id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      userhash: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      ssid: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      created: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
  
    })

  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('caldav_accounts');
    await queryInterface.dropTable('calendar_events');
    await queryInterface.dropTable('calendars');
    await queryInterface.dropTable('custom_filters');
    await queryInterface.dropTable('labels');
    await queryInterface.dropTable('otp_table');
    await queryInterface.dropTable('settings');
    await queryInterface.dropTable('ssid_table');

    
  }
};
