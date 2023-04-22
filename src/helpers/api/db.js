import { varNotEmpty } from '../general';

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

