import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface caldav_accountsAttributes {
  caldav_accounts_id: number;
  username?: string;
  password?: string;
  url?: string;
  userid?: string;
  name?: string;
  authMethod?: string;
}

export type caldav_accountsPk = "caldav_accounts_id";
export type caldav_accountsId = caldav_accounts[caldav_accountsPk];
export type caldav_accountsOptionalAttributes = "caldav_accounts_id" | "username" | "password" | "url" | "userid" | "name" | "authMethod";
export type caldav_accountsCreationAttributes = Optional<caldav_accountsAttributes, caldav_accountsOptionalAttributes>;

export class caldav_accounts extends Model<caldav_accountsAttributes, caldav_accountsCreationAttributes> implements caldav_accountsAttributes {
  caldav_accounts_id!: number;
  username?: string;
  password?: string;
  url?: string;
  userid?: string;
  name?: string;
  authMethod?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof caldav_accounts {
    return caldav_accounts.init({
    caldav_accounts_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(3000),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    authMethod: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'caldav_accounts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "caldav_accounts_id" },
        ]
      },
    ]
  });
  }
}
