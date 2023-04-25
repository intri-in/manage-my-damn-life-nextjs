import { getConnectionVar } from "./db";

export async function insertNewFiltertoDB(name, filtervalue, userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query('INSERT INTO custom_filters (name, filtervalue, userid) VALUES (?,? ,?)', [name,  filtervalue, userid], function (error, results, fields) {
            if (error) {
                console.log(error.message)
            }
            con.end()
            resolve(results)
            });
    
    })

}

export async function getFiltersFromDB(userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT name, filtervalue,custom_filters_id FROM custom_filters WHERE userid= ?", [userid], function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))));

        })
        
    })

}

export async function updateFilterinDB(custom_filters_id, name, filtervalue)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
         con.query('UPDATE custom_filters SET ? WHERE custom_filters_id = ?',[{name :name, filtervalue: filtervalue }, custom_filters_id], function (error, results, fields) {
        if (error) {
            resolve(error.message)
        }
        resolve(null)
        })
    }
    )

}

