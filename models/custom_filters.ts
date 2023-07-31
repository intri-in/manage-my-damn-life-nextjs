import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface custom_filtersAttributes {
  custom_filters_id: number;
  name?: string;
  filtervalue?: string;
  userid?: string;
}

export type custom_filtersPk = "custom_filters_id";
export type custom_filtersId = custom_filters[custom_filtersPk];
export type custom_filtersOptionalAttributes = "custom_filters_id" | "name" | "filtervalue" | "userid";
export type custom_filtersCreationAttributes = Optional<custom_filtersAttributes, custom_filtersOptionalAttributes>;

export class custom_filters extends Model<custom_filtersAttributes, custom_filtersCreationAttributes> implements custom_filtersAttributes {
  custom_filters_id!: number;
  name?: string;
  filtervalue?: string;
  userid?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof custom_filters {
    return custom_filters.init({
    custom_filters_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    filtervalue: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'custom_filters',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "custom_filters_id" },
        ]
      },
    ]
  });
  }
}
