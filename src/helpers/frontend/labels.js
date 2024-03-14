import { MYDAY_LABEL } from '@/config/constants';
import { getAPIURL, isValidObject, isValidResultArray, logVar } from '../general';
import { getUserDB } from './db';
import { objectArrayHasKey, getRandomColourCode} from './general';
import { getAuthenticationHeadersforUser } from './user';
import { getLabelArrayFromCookie, saveLabelArrayToCookie } from './settings';
import { getErrorResponse } from '../errros';

export async function saveLabeltoDB(label)
{
    //Check if label exists, else add.
    var db =getUserDB()
    const labelFromDB= await getUserDB().labels
    .where("name").equalsIgnoreCase(label)
    .toArray().then((labelFromDB)  => {
        if(labelFromDB==null|| labelFromDB!=null && labelFromDB.length==0)
        {
            var name = label
            var colour = getRandomColourCode()
            db.labels.add({
                name: name, colour: colour
            });
    
        }
       

    })



}

export async function getLabelColourFromDB(label)
{
    return new Promise( (resolve, reject) => {
        getUserDB().labels
.where("name").equalsIgnoreCase(label)
.toArray().then((labelFromDB) =>{
    if(labelFromDB!=null && labelFromDB.length>0 && Array.isArray(labelFromDB))
        {
            return resolve(labelFromDB[0].colour)
        }
})

    })

}

export async function getAllLablesFromDB()
{
     
    const all = await getUserDB().labels.toArray()
    var finalLabelArray={}
    if(all!=null && Array.isArray(all) && all.length>0)
    {
        for (let i=0; i<all.length; i++)
        {
            if(!objectArrayHasKey(finalLabelArray, all[i].name))
            {
                finalLabelArray[all[i].name]={name: all[i].name, colour: all[i].colour}
            }
        }
    }

    return finalLabelArray     
}

export async function getLabelsFromServer()
{
    const url_api=getAPIURL()+"caldav/calendars/labels"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }

    return new Promise( (resolve, reject) => {

            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                if(body!=null && body.data.message!=null)
                {
                    var labels= body.data.message
                    saveLabelArrayToCookie(labels)
                    resolve (labels)
                }
                else
                {
                    return resolve(null)
                }
                    
    
            }).catch(e =>{
                console.error("getLabelsFromServer", e)
                return resolve(null)
            })
    })
} 
export async function makeUpdateLabelRequest()
{
    const url_api=getAPIURL()+"labels/updatecache"
    const authorisationData=await getAuthenticationHeadersforUser()

    const requestOptions =
    {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({'authorization': authorisationData}),

    }
    return new Promise( (resolve, reject) => {
            const response =  fetch(url_api, requestOptions)
            .then(response => response.json())
            .then((body) =>{
                return resolve(body)
            }).catch(e =>{
            console.error("makeUpdateLabelRequest", e)
            return resolve(getErrorResponse(e))
            })
    })

}
export function searchLabelObject(objectToSearch, searchTerm)
{
    let resultArray=[]

    if(isValidObject(objectToSearch)&&searchTerm!=null&&searchTerm.trim()!="")
    {
        const regex = new RegExp(searchTerm+"*");

        for (const i in objectToSearch)
        {
            var toSearch = objectToSearch[i].name.toString().toLowerCase()

            if(toSearch.includes(searchTerm.toLowerCase()))
            {
                resultArray.push(objectToSearch[i].name)
            }

        }

        
    }

    return resultArray
}

export function categoryArrayHasMyDayLabel(categoryArray)
{
    if(!categoryArray)
    {
        return false
    }
    if(categoryArray.length==0)
    {
        return false
    }
    let found = false
    for (const i in categoryArray)
    {
        if(categoryArray[i]==MYDAY_LABEL)
        {
            return true
        }
    }

    return found
}
export function removeLabelFromCategoryArray(categoryArray, labelToRemove){
    let newArray = []
    for (const i in categoryArray) {
        if (categoryArray[i].toLowerCase().trim() != labelToRemove.toLowerCase()) {
            newArray.push(categoryArray[i])
        }
    }
    return newArray
}
export function categoryArrayHasLabel(categoryArray, label)
{
    let found = false
    for (const i in categoryArray)
    {
        if(categoryArray[i].toLowerCase()==label.toLowerCase())
        {
            return true
        }
    }

    return found
}

export function removeMyDayLabelFromArray(categoryArray)
{
    let newArray = []
    for (const i in categoryArray)
    {
        if(categoryArray[i]!=MYDAY_LABEL)
        {
            newArray.push(categoryArray[i])
        }
    }

    return newArray


}

export function labelIndexInCookie(labelName)
{
    var labelArrayFromCookie = getLabelArrayFromCookie()

    if(isValidResultArray(labelArrayFromCookie))
    {
        for(const i in labelArrayFromCookie)
        {
            if(labelArrayFromCookie[i].name==labelName)
            {
                return i
            }
        }
    }
    return -1

}