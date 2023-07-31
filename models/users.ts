import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface usersAttributes {
  users_id: number;
  username?: string;
  email?: string;
  password?: string;
  created?: string;
  level?: string;
  userhash?: string;
  mobile?: string;
  id?: number;
  expires?:Date;
  session_token?:string;
  name?:string;
  email_verified?:string;
  image?:string    

}

export type usersPk = "users_id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "users_id" | "username" | "email" | "password" | "created" | "level" | "userhash" | "mobile";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  users_id!: number;
  username?: string;
  email?: string;
  password?: string;
  created?: string;
  level?: string;
  userhash?: string;
  mobile?: string;
  id?: number;
  expires?:Date;
  session_token?:string;
  name?:string;
  email_verified?:string;
  image?:string    


  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return users.init({
    users_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    created: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    level: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userhash: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,

    },
    expires:{
      type: Sequelize.DataTypes.DATE,     

    },
    session_token:{
      type: Sequelize.DataTypes.STRING,
      unique: "sessionToken",
    },
    name:{
      type: Sequelize.DataTypes.STRING      
    },
    email_verified:{
      type: Sequelize.DataTypes.STRING,    
    },
    image:{
      type: Sequelize.DataTypes.STRING,       

    }

  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "users_id" },
        ]
      },
    ]
  });
  }
}
