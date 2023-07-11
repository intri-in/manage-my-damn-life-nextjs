import { varNotEmpty } from '../general';
const { Sequelize } = require('sequelize');

export function getConnectionVar()
{
    var db = require('mysql');

      var con = db.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database : process.env.DB_NAME,
        password: process.env.DB_PASS
      });
      

   

      return con;
}

export function getSimpleConnectionVar()
{
  var db = require('mysql');

  var con = db.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });
  

  return con
}


export function getSequelizeObj(){

    const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
     {
       host: process.env.DB_HOST,
       dialect: 'mysql'
     });

     return sequelize


}

export async function testDBConnectionSequelize(){
  var sequelize= getSequelizeObj()
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    return null
  } catch (error) {
    console.error('testDBConnectionSequelize: Unable to connect to the database:', error);
    return error
  }
  
}