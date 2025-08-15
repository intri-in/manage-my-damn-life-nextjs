import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface webcal_accountsAttributes {
    id: number;
    name?: string;
    userid?:string;
    link?:string
    lastFetched?:string
    updateInterval?: string
    colour?:string

}

export type webcal_accountsPk = "id";
export type webcal_accountsId = webcal_accounts[webcal_accountsPk];
export type webcal_accountsOptionalAttributes = "id" | "name" | "userid" | "link" | "lastFetched" | "updateInterval" | "colour";
export type webcal_accountsCreationAttributes = Optional<webcal_accountsAttributes, webcal_accountsOptionalAttributes>;



export class webcal_accounts extends Model <webcal_accountsAttributes, webcal_accountsCreationAttributes> implements webcal_accountsAttributes {

declare createdAt: Sequelize.CreationOptional<Date>;
declare updatedAt: Sequelize.CreationOptional<Date>;
id: number;
name?: string;
userid?:string;
link?:string
updateInterval?: string
lastFetched?:string
colour?:string
  static initModel(sequelize: Sequelize.Sequelize): typeof webcal_accounts {
  return  webcal_accounts.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true

    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    userid: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    link: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    colour: {
      type: DataTypes.STRING(45),
      allowNull: true
   },
    lastFetched: {
      type: DataTypes.STRING,
    allowNull: true
  },
  updateInterval: {
    type: DataTypes.STRING,
  }

  }, {
    sequelize,
    tableName: 'webcal_accounts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
}
};