import { varNotEmpty } from "../general"
import { getConnectionVar } from "./db"

export const FINAL_TABLES=["caldav_accounts", "calendar_events" , "calendars", "custom_filters", "labels", "otp_table", "settings", "ssid_table", "users"]

export async function testDBConnection(){
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
       
     con.ping( err=>{
        resolve(err)

     })
    })
}
export async function isInstalled()
{
    var allTables = await getListofTables()
    if(varNotEmpty(allTables) && allTables.length==FINAL_TABLES.length)
    {
        return true
    }else{
        return false
    }
}
export async function getListofTables()
{

    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SHOW TABLES", [], function (err, result, fields) {
            con.end()
            if (err){
                resolve(err)
            }
            resolve(result)
        })
        
    })
}

export function installTables(table_name)
{

    var query=""
    switch(table_name) {
        case "caldav_accounts":
          query="CREATE TABLE IF NOT EXISTS caldav_accounts (caldav_accounts_id int NOT NULL AUTO_INCREMENT,username varchar(45) DEFAULT NULL,password varchar(3000) DEFAULT NULL,url varchar(1000) DEFAULT NULL,userid varchar(45) DEFAULT NULL,name varchar(100) DEFAULT NULL ,  authMethod varchar(45) DEFAULT NULL, PRIMARY KEY (caldav_accounts_id)) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
        break;
        case "calendar_events":
            query="CREATE TABLE IF NOT EXISTS calendar_events (calendar_events_id int NOT NULL AUTO_INCREMENT,url varchar(3000) DEFAULT NULL,etag varchar(1000) DEFAULT NULL,data varchar(5000) DEFAULT NULL,updated varchar(45) DEFAULT NULL,type varchar(45) DEFAULT NULL,calendar_id varchar(45) DEFAULT NULL,deleted varchar(45) DEFAULT NULL,PRIMARY KEY (calendar_events_id)) ENGINE=InnoDB AUTO_INCREMENT=448 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
        case "calendars":
            query="CREATE TABLE IF NOT EXISTS calendars (calendars_id bigint NOT NULL AUTO_INCREMENT,displayName varchar(45) DEFAULT NULL,url varchar(200) DEFAULT NULL,ctag varchar(200) DEFAULT NULL,description varchar(45) DEFAULT NULL,calendarColor varchar(45) DEFAULT NULL,syncToken varchar(200) DEFAULT NULL,timezone varchar(45) DEFAULT NULL,reports varchar(2000) DEFAULT NULL,resourcetype varchar(45) DEFAULT NULL,caldav_accounts_id varchar(45) DEFAULT NULL,updated varchar(45) DEFAULT NULL,PRIMARY KEY (calendars_id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
        case "custom_filters":
            query="CREATE TABLE IF NOT EXISTS custom_filters (custom_filters_id int NOT NULL AUTO_INCREMENT,name varchar(100) DEFAULT NULL,filtervalue varchar(1000) DEFAULT NULL,userid varchar(45) DEFAULT NULL,PRIMARY KEY (custom_filters_id)) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
        case "labels":
            query="CREATE TABLE IF NOT EXISTS labels (labels_id int NOT NULL AUTO_INCREMENT,name varchar(45) DEFAULT NULL,colour varchar(45) DEFAULT NULL,userid varchar(45) DEFAULT NULL,PRIMARY KEY (labels_id)) ENGINE=InnoDB AUTO_INCREMENT=951 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;

        case "otp_table":
            query="CREATE TABLE IF NOT EXISTS otp_table (otp_table_id int NOT NULL AUTO_INCREMENT,userid varchar(45) DEFAULT NULL,otp varchar(45) DEFAULT NULL,created varchar(45) DEFAULT NULL,type varchar(45) DEFAULT NULL,reqid varchar(2000) DEFAULT NULL,PRIMARY KEY (otp_table_id)) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;

        case "settings":
            query="CREATE TABLE IF NOT EXISTS settings (settings_id int NOT NULL AUTO_INCREMENT,name varchar(200) DEFAULT NULL,userid varchar(45) DEFAULT NULL,global varchar(45) DEFAULT NULL,value varchar(1000) DEFAULT NULL,PRIMARY KEY (settings_id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
        case "ssid_table":
            query="CREATE TABLE IF NOT EXISTS ssid_table (ssid_table_id int NOT NULL AUTO_INCREMENT,userhash varchar(1000) DEFAULT NULL,ssid varchar(1000) DEFAULT NULL,created varchar(45) DEFAULT NULL,PRIMARY KEY (ssid_table_id)) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
        case "users":
            query="CREATE TABLE IF NOT EXISTS users (users_id int NOT NULL AUTO_INCREMENT,  username varchar(45) DEFAULT NULL, email varchar(45) DEFAULT NULL,            password varchar(1000) DEFAULT NULL,created varchar(45) DEFAULT NULL,level varchar(45) DEFAULT NULL, userhash varchar(1000) DEFAULT NULL,mobile varchar(45) DEFAULT NULL, PRIMARY KEY (users_id)) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"
            break;
  
        default:
          
      }
      
      var con = getConnectionVar()
      return new Promise( (resolve, reject) => {
          con.query(query, [], function (err, result, fields) {
              con.end()
              if (err){
                  resolve(err)
                  console.log(err)
              }
              resolve(result)
          })
          
      })
  
}