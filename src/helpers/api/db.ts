import { varNotEmpty } from '../general';
import { shouldLogforAPI } from '../logs';
const { Sequelize } = require('sequelize');

export function getConnectionVar()
{

    throw new Error("getConnectionVar")
    var db = require('mysql2');

      var con = db.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        database : process.env.DB_NAME,
        password: process.env.DB_PASS
      });
      

   

      return con;
}

export function getSimpleConnectionVar()
{
  var db = require('mysql2');

  var con = db.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS
  });
  

  return con
}


export function getSequelizeObj(raw?): typeof Sequelize{

  const dialect= process.env.DB_DIALECT ? process.env.DB_DIALECT.toLowerCase() :  "mysql"
  const db_host_settings={
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: dialect,
    query:{

      raw: typeof(raw)!="undefined" ? raw: true,
    },
    logging: shouldLogforAPI()

  }
  // console.log("getSequelizeObj() dialect ->>>", dialect)
  switch(dialect){
    case "mysql":
      db_host_settings["dialectModule"]= require('mysql2')
      break;
    case "postgres":
      db_host_settings["dialectModule"]= require('pg')
      break;
    case "sqlite":
      db_host_settings["dialectModule"]= require('sqlite3')
      db_host_settings["storage"]=process.env.DB_NAME

  }
  if(dialect=="sqlite"){
    return new Sequelize(
      {
      dialect: "sqlite",
      storage: process.env.DB_NAME}
      
      );
  }
    const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    db_host_settings,
    
    );

    return sequelize


}

export async function sequelizeCanConnecttoDB(){
  var sequelize= getSequelizeObj()
  try {
    await sequelize.authenticate();
    if(shouldLogforAPI()) console.log('Connection has been established successfully.');

    return true
  } catch (error) {
    if(shouldLogforAPI()) console.log('Db Connection Failed:', error);
    return error
  }
  
}