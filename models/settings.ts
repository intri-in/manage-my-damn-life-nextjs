import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface settingsAttributes {
  settings_id: number;
  name?: string;
  userid?: string;
  global?: string;
  value?: string;
}

export type settingsPk = "settings_id";
export type settingsId = settings[settingsPk];
export type settingsOptionalAttributes = "settings_id" | "name" | "userid" | "global" | "value";
export type settingsCreationAttributes = Optional<settingsAttributes, settingsOptionalAttributes>;

export class settings extends Model<settingsAttributes, settingsCreationAttributes> implements settingsAttributes {
  settings_id!: number;
  name?: string;
  userid?: string;
  global?: string;
  value?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof settings {
    return settings.init({
    settings_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    global: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'settings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "settings_id" },
        ]
      },
    ]
  });
  }
}
