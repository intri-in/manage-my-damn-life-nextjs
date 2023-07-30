import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface calendar_eventsAttributes {
  calendar_events_id: number;
  url?: string;
  etag?: string;
  data?: string;
  updated?: string;
  type?: string;
  calendar_id?: string;
  deleted?: string;
}

export type calendar_eventsPk = "calendar_events_id";
export type calendar_eventsId = calendar_events[calendar_eventsPk];
export type calendar_eventsOptionalAttributes = "calendar_events_id" | "url" | "etag" | "data" | "updated" | "type" | "calendar_id" | "deleted";
export type calendar_eventsCreationAttributes = Optional<calendar_eventsAttributes, calendar_eventsOptionalAttributes>;

export class calendar_events extends Model<calendar_eventsAttributes, calendar_eventsCreationAttributes> implements calendar_eventsAttributes {
  calendar_events_id!: number;
  url?: string;
  etag?: string;
  data?: string;
  updated?: string;
  type?: string;
  calendar_id?: string;
  deleted?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof calendar_events {
    return calendar_events.init({
    calendar_events_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING(3000),
      allowNull: true
    },
    etag: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    data: {
      type: DataTypes.STRING(5000),
      allowNull: true
    },
    updated: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    calendar_id: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    deleted: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'calendar_events',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "calendar_events_id" },
        ]
      },
    ]
  });
  }
}
