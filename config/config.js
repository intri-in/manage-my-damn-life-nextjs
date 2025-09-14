const dotenv = require('dotenv')
dotenv.config({ override: true });
const dialect = process.env.DB_DIALECT ?? "mysql"
module.exports = {
  local: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: dialect
  },
  sqlite:{
    dialect:"sqlite",
    storage: process.env.DB_NAME
  },
}

