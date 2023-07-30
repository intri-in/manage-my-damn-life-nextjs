import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface labelsAttributes {
  labels_id: number;
  name?: string;
  colour?: string;
  userid?: string;
}

export type labelsPk = "labels_id";
export type labelsId = labels[labelsPk];
export type labelsOptionalAttributes = "labels_id" | "name" | "colour" | "userid";
export type labelsCreationAttributes = Optional<labelsAttributes, labelsOptionalAttributes>;

export class labels extends Model<labelsAttributes, labelsCreationAttributes> implements labelsAttributes {
  labels_id!: number;
  name?: string;
  colour?: string;
  userid?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof labels {
    return labels.init({
    labels_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    colour: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'labels',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "labels_id" },
        ]
      },
    ]
  });
  }
}
