import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface templatesAttributes {
  id: number;
  name?: string;
  type?:string;
  data?:string;
  userid?:string
}

export type templatesPk = "id";
export type templatesId = templates[templatesPk];
export type templatesOptionalAttributes = "id" | "name" | "type" | "data" | "userid";
export type templatesCreationAttributes = Optional<templatesAttributes, templatesOptionalAttributes>;



export class templates extends Model <templatesAttributes, templatesCreationAttributes> implements templatesAttributes {
  
  declare createdAt: Sequelize.CreationOptional<Date>;
  declare updatedAt: Sequelize.CreationOptional<Date>;
    id: number;
  name?: string;
  type?:string;
  data?:string
  userid?:string
  static initModel(sequelize: Sequelize.Sequelize): typeof templates {
  return  templates.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true

    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userid:{
      type: DataTypes.STRING(5000),
      allowNull: true

    },
    data: {
      type: DataTypes.STRING(5000),
    allowNull: true
  }
  }, {
    sequelize,
    tableName: 'templates',
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