import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getRandomColourCode, isValidResultArray } from "@/helpers/general";
import { getConnectionVar } from "../db";
import { getAllCalendarEvents } from "./caldav";


export async function updateLabels()
{
    
    var allEvents= await getAllCalendarEvents()
    var con = getConnectionVar()

    if(allEvents!=null && Array.isArray(allEvents) && allEvents.length>0)
    {
        for (let i=0; i<allEvents.length; i++)
        {
            var parsedData = returnGetParsedVTODO(allEvents[i].data)
           if(parsedData!=null) 
           {
                if(parsedData.category!=null && parsedData.category.length>0)
                {
                    // Event has labels.
                    for(let j=0; j<parsedData.category.length; j++)
                    {
                        var labelinDB =await checkifLabelExistsinDB(parsedData.category[j])
                        if(labelinDB==false)
                        {
                            var colour= getRandomColourCode()
                            con.query('INSERT INTO labels (name, colour) VALUES (?,?)', [parsedData.category[j], colour], function (error, results, fields) {
                                con.end()
                                
                                if (error) {
                                    throw error.message
                                }
                    
                            });
            

                        }
                    }
                    
                }
           }
        }

    }
}

export async function checkifLabelExistsinDB(label)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM labels WHERE name=?", [label], function (err, result, fields) {
            if (err) throw err;
            con.end()
            var result = Object.values(JSON.parse(JSON.stringify(result)))
            if(result!=null && Object.keys(result).length>0)
            {
                resolve(true);

            }else
            {
                resolve(false)
            }
    
        })
        })

}

export async function getAllLablesFromDB()
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM labels", [], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))))
    
        })
        })

}