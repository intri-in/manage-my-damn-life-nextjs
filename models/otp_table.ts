import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface otp_tableAttributes {
  otp_table_id: number;
  userid?: string;
  otp?: string;
  created?: string;
  type?: string;
  reqid?: string;
}

export type otp_tablePk = "otp_table_id";
export type otp_tableId = otp_table[otp_tablePk];
export type otp_tableOptionalAttributes = "otp_table_id" | "userid" | "otp" | "created" | "type" | "reqid";
export type otp_tableCreationAttributes = Optional<otp_tableAttributes, otp_tableOptionalAttributes>;

export class otp_table extends Model<otp_tableAttributes, otp_tableCreationAttributes> implements otp_tableAttributes {
  otp_table_id!: number;
  userid?: string;
  otp?: string;
  created?: string;
  type?: string;
  reqid?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof otp_table {
    return otp_table.init({
    otp_table_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    created: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    reqid: {
      type: DataTypes.STRING(2000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'otp_table',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "otp_table_id" },
        ]
      },
    ]
  });
  }
}
