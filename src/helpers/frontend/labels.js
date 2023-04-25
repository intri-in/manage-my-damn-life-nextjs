import { MYDAY_LABEL } from '@/config/constants';
import { getAPIURL, isValidObject, isValidResultArray } from '../general';
import { getUserDB } from './db';
import { objectArrayHasKey, getRandomColourCode} from './general';
import { getAuthenticationHeadersforUser } from './user';
import { getLabelArrayFromCookie, saveLabelArrayToCookie } from './settings';

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
            resolve(labelFromDB[0].colour)
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
            //Save the events to db.
            if(body!=null && body.data.message!=null)
            {
                var labels= body.data.message
                saveLabelArrayToCookie(labels)
                resolve (labels)
            }
            else
            {
                resolve(null)
            }
                

        });
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
            resolve(body)
        });
    })

}
export function searchLabelObject(objectToSearch, searchTerm)
{
    var resultArray=[]

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
    var found = false
    for (const i in categoryArray)
    {
        if(categoryArray[i]==MYDAY_LABEL)
        {
            return true
        }
    }

    return found
}

export function categoryArrayHasLabel(categoryArray, label)
{
    var found = false
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
    var newArray = []
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