import { custom_filters } from "models/custom_filters";
import { getConnectionVar, getSequelizeObj } from "./db";

const custom_filtersModel = custom_filters.initModel(getSequelizeObj())
export async function insertNewFiltertoDB(name, filtervalue, userid)
{
    await custom_filtersModel.create({ name:name, filtervalue:filtervalue, userid:userid });
    return
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query('INSERT INTO custom_filters (name, filtervalue, userid) VALUES (?,? ,?)', [name,  filtervalue, userid], function (error, results, fields) {
    //         if (error) {
    //             console.log(error.message)
    //         }
    //         con.end()
    //         return resolve(results)
    //         });
    
    // })

}

export async function getFiltersFromDB(userid)
{
    return await custom_filtersModel.findAll({
        where: {
            userid: userid.toString(),
        },
      });

    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //     con.query("SELECT name, filtervalue,custom_filters_id FROM custom_filters WHERE userid= ?", [userid], function (err, result, fields) {
    //         con.end()
    //         if (err) {
    //             console.log(err);
    //             return resolve(null)
    //         }
            
    //         return resolve(Object.values(JSON.parse(JSON.stringify(result))));

    //     })
        
    // })

}

export async function updateFilterinDB(custom_filters_id, name, filtervalue)
{
    // Change everyone without a last name to "Doe"
    await custom_filtersModel.update(
        { name: name,
        filtervalue:filtervalue
         },
        {
        where: {
            custom_filters_id: custom_filters_id,
        },
        },
    );

  return
    // var con = getConnectionVar()
    // return new Promise( (resolve, reject) => {
    //      con.query('UPDATE custom_filters SET ? WHERE custom_filters_id = ?',[{name :name, filtervalue: filtervalue }, custom_filters_id], function (error, results, fields) {
    //     if (error) {
    //         return resolve(error.message)
    //     }
    //     return resolve(null)
    //     })
    // }
    // )

}

