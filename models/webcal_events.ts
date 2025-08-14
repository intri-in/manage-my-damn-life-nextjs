import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface webcal_eventsAttributes {
  id: number;
  webcal_accounts_id?: string;
  name?:string;
  data?:string
  
}

export type webcal_eventsPk = "id";
export type webcal_eventsId = webcal_events[webcal_eventsPk];
export type webcal_eventsOptionalAttributes = "id" | "webcal_accounts_id" | "data" ;
export type webcal_eventsCreationAttributes = Optional<webcal_eventsAttributes, webcal_eventsOptionalAttributes>;



export class webcal_events extends Model <webcal_eventsAttributes, webcal_eventsCreationAttributes> implements webcal_eventsAttributes {

declare createdAt: Sequelize.CreationOptional<Date>;
declare updatedAt: Sequelize.CreationOptional<Date>;
id: number;
webcal_accounts_id?: string;
data?:string
  static initModel(sequelize: Sequelize.Sequelize): typeof webcal_events {
  return  webcal_events.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true

    },                
    webcal_accounts_id: { type: Sequelize.STRING},
    data: {
    type: Sequelize.STRING(5000),
    allowNull: true
    },


  }, {
    sequelize,
    tableName: 'webcal_events',
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