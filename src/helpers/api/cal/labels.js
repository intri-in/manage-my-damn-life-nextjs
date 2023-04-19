import { returnGetParsedVTODO } from "@/helpers/frontend/calendar";
import { getRandomColourCode, isValidResultArray } from "@/helpers/general";
import { getConnectionVar } from "../db";
import { getAllCalendarEvents } from "./caldav";
import { majorTaskFilter } from "@/helpers/frontend/events";
import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants";
import { User } from "../classes/User";


export async function updateLabelsOld()
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
export async function updateLabels(userid)
{
    
    var usrObj = new User(userid)
    var allEvents= await usrObj.getAllEvents("VTODO")
    var con = getConnectionVar()
    var allLabelsInDB= await getAllLablesFromDB(userid)

   
    var newLabelList = []
    if(allEvents!=null && Array.isArray(allEvents) && allEvents.length>0)
    {
        for (let i=0; i<allEvents.length; i++)
        {
           var parsedData = returnGetParsedVTODO(allEvents[i].data)
           if(parsedData!=null && majorTaskFilter(parsedData)==true && ( allEvents[i].deleted=="" ||  allEvents[i].deleted=="0"  || allEvents[i].deleted=="false" ||allEvents[i].deleted==null )) 
           {
                if(parsedData.category!=null && parsedData.category.length>0)
                {
                    // Event has labels.
                    for(let j=0; j<parsedData.category.length; j++)
                    {
                       if(SearchLabelArray(newLabelList, parsedData.category[j])==false)
                       {
                            newLabelList.push({name: parsedData.category[j]})
            

                       }

                       //If the label isn't in DB already, we add it.
                       if(await checkifLabelExistsinDB(parsedData.category[j], userid)==false)
                       {
                            const insertResult = await insertLabelIntoDB(parsedData.category[j], userid)

                       }

                    }
                    
                }
           }
        }

    }
    console.log(newLabelList)
    // Now we have the new list of Labels. We delete the extra ones.
    allLabelsInDB= await getAllLablesFromDB(userid) //Refresh List
    var toDelete = []
    for (const j in allLabelsInDB)
    {
        if(SearchLabelArray(newLabelList, allLabelsInDB[j].name) ==false)
        {
        
            //Delete the extra label.
            //Don't delete if it starts with system default label prefix, as it is an internal label.
            if(allLabelsInDB[j].name.startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-")==false)
            {
                toDelete.push(allLabelsInDB[j])
                deleteLabelFromDB(allLabelsInDB[j].name, userid)
            }
        }
    }
    //console.log(allLabelsInDB, "toDelete", toDelete)
    return null
}

export async function modifyLabelColour(name, newColour, userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
         con.query('UPDATE labels SET ? WHERE userid = ? AND name=?',[{colour: newColour }, userid, name], function (error, results, fields) {
        if (error) {
            resolve(error.message)
        }
        resolve(null)
        })
    }
    )

}
function SearchLabelArray(labelArray, toSearch)
{
    if(isValidResultArray(labelArray))
    {
        for (const i in labelArray)
        {
            if(labelArray[i].name == toSearch)
            {
                return true
            }
        }
    }

    return false
}

export async function deleteLabelFromDB(name, userid)
{
    var con = getConnectionVar()

    return new Promise( (resolve, reject) => {
        con.query('DELETE FROM labels WHERE name=? AND userid=?', [name, userid], function (error, results, fields) {
        if (error) {
            console.log(error.message)
        }
        con.end()

        resolve(true)
        });
    })

}
export async function insertLabelIntoDB(name, userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        var colour= getRandomColourCode()
        con.query('INSERT INTO labels (name, colour, userid) VALUES (?,?,?)', [name, colour, userid], function (error, results, fields) {
            con.end()
            
            if (error) {
                throw error.message
            }
            resolve (null)

        });

    })
}
export async function checkifLabelExistsinDB(label,userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM labels WHERE name=? AND userid=?", [label, userid], function (err, result, fields) {
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

export async function getAllLablesFromDB(userid)
{
    var con = getConnectionVar()
    return new Promise( (resolve, reject) => {
        con.query("SELECT * FROM labels WHERE userid=?", [userid], function (err, result, fields) {
            if (err) throw err;
            con.end()
            resolve(Object.values(JSON.parse(JSON.stringify(result))))
    
        })
        })

}