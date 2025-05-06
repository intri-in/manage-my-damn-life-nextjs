import { isValidResultArray } from "@/helpers/general";
import { getSequelizeObj } from "../db";
import { custom_filters } from "models/custom_filters";
const custom_filtersModel = custom_filters.initModel(getSequelizeObj())
export class Filters{

    filterid: string | number
    constructor(filterid)
    {
        this.filterid= filterid
    }

    /**
     * Deletes filter from Database.
     * @param {*} userid 
     */
    async delete(userid)
    {

        return custom_filtersModel.destroy({
            where:{
                custom_filters_id: parseInt(this.filterid.toString()),
                userid: userid.toString()
            }
        })
        console.log("response")
        // var con = getConnectionVar()

        // return new Promise( (resolve, reject) => {
        //     con.query('DELETE FROM custom_filters WHERE custom_filters_id=?', [this.filterid], function (error, results, fields) {
        //     if (error) {
        //         return resolve(error)
        //     }
        //     con.end()

        //     return resolve(null)
        //     });
        // })
    

    }

    /**
     * Gets Filter from database.
     * @param {*} userid 
     * @returns Filter object from database.
     */
    static async getFromDB(userid, filterid)
    {

        return custom_filtersModel.findAll({
            where: {
                userid: userid.toString(),
                custom_filters_id:filterid
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


    /**
     * Checks if the user has access to current filter.
     * @param {*} userid 
     * @returns Boolean
     */
    static async userHasAccess(userid, filterid)
    {
        var filterFromDB = await this.getFromDB(userid, filterid)
        // console.log(filterFromDB)
        if(isValidResultArray(filterFromDB))
        {
            if(filterFromDB[0].userid==userid)
            {
                return true
            }
            else
            {
                return false
            }
        }
        else
        {
            return false
        }
    }

} 