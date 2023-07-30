import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ssid_tableAttributes {
  ssid_table_id: number;
  userhash?: string;
  ssid?: string;
  created?: string;
}

export type ssid_tablePk = "ssid_table_id";
export type ssid_tableId = ssid_table[ssid_tablePk];
export type ssid_tableOptionalAttributes = "ssid_table_id" | "userhash" | "ssid" | "created";
export type ssid_tableCreationAttributes = Optional<ssid_tableAttributes, ssid_tableOptionalAttributes>;

export class ssid_table extends Model<ssid_tableAttributes, ssid_tableCreationAttributes> implements ssid_tableAttributes {
  ssid_table_id!: number;
  userhash?: string;
  ssid?: string;
  created?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof ssid_table {
    return ssid_table.init({
    ssid_table_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userhash: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    ssid: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    created: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ssid_table',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ssid_table_id" },
        ]
      },
    ]
  });
  }
}
