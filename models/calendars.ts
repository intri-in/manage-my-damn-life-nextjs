import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface calendarsAttributes {
  calendars_id: number;
  displayName?: string;
  url?: string;
  ctag?: string;
  description?: string;
  calendarColor?: string;
  syncToken?: string;
  timezone?: string;
  reports?: string;
  resourcetype?: string;
  caldav_accounts_id?: string;
  updated?: string;
}

export type calendarsPk = "calendars_id";
export type calendarsId = calendars[calendarsPk];
export type calendarsOptionalAttributes = "calendars_id" | "displayName" | "url" | "ctag" | "description" | "calendarColor" | "syncToken" | "timezone" | "reports" | "resourcetype" | "caldav_accounts_id" | "updated";
export type calendarsCreationAttributes = Optional<calendarsAttributes, calendarsOptionalAttributes>;

export class calendars extends Model<calendarsAttributes, calendarsCreationAttributes> implements calendarsAttributes {
  calendars_id!: number;
  displayName?: string;
  url?: string;
  ctag?: string;
  description?: string;
  calendarColor?: string;
  syncToken?: string;
  timezone?: string;
  reports?: string;
  resourcetype?: string;
  caldav_accounts_id?: string;
  updated?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof calendars {
    return calendars.init({
    calendars_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    displayName: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    ctag: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    calendarColor: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    syncToken: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    reports: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    resourcetype: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    caldav_accounts_id: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    updated: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'calendars',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "calendars_id" },
        ]
      },
    ]
  });
  }
}
