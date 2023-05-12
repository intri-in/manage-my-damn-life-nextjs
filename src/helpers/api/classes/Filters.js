import { isValidResultArray } from "@/helpers/general";
import { getConnectionVar } from "../db";

export class Filters{

    constructor(filterid)
    {
        this.filterid= filterid
    }

    /**
     * Deletes filter from Database.
     * @param {*} userid 
     */
    async delete()
    {
        var con = getConnectionVar()

        return new Promise( (resolve, reject) => {
            con.query('DELETE FROM custom_filters WHERE custom_filters_id=?', [this.filterid], function (error, results, fields) {
            if (error) {
                return resolve(error)
            }
            con.end()

            return resolve(null)
            });
        })
    

    }

    /**
     * Gets Filter from database.
     * @param {*} userid 
     * @returns Filter object from database.
     */
    static async getFromDB(userid)
    {
        var con = getConnectionVar()
        return new Promise( (resolve, reject) => {
            con.query("SELECT name, filtervalue,custom_filters_id FROM custom_filters WHERE userid= ?", [userid], function (err, result, fields) {
                con.end()
                if (err) {
                    console.log(err);
                    return resolve(null)
                }                
                return resolve(Object.values(JSON.parse(JSON.stringify(result))));

            })
            
        })

    }


    /**
     * Checks if the user has access to current filter.
     * @param {*} userid 
     * @returns Boolean
     */
    static async userHasAccess(userid)
    {
        var filterFromDB = await this.getFromDB(userid)
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