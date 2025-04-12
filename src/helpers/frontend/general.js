
import i18next from 'i18next';
import *  as translations from '@/i18n/strings.json'
import * as moment from 'moment';
import { isValidResultArray, varNotEmpty } from '../general';
import { getMessageFromAPIResponse } from './response';
import LanguageDetector from 'i18next-browser-languagedetector';

export function getI18nObject()
{
    i18next
        .use(LanguageDetector)
        .init({
            fallbackLng: 'en',
            debug: false,
            resources: 
                translations,
          });

      return i18next

}

export function ISODatetoHuman(date)
{
    if(date!=null && date!=undefined && typeof(date)=="string")
    {
        var dateToReturn=""
        var dateArray = date.split('T')
        if(dateArray!=null && Array.isArray(dateArray) && dateArray.length>0)
        {
            var year=""
            var month=""
            var date=""
            var hh=""
            var mm=""
            var ss=""
            
            if(dateArray[0].length==8)
            {
                year=dateArray[0].substring(0,4)
                month=dateArray[0].substring(4,6)
                date=dateArray[0].substring(6,8)

                dateToReturn= date+"/"+month+"/"+year
            }
            if(dateArray.length>1)
            {
                if(dateArray[1].length==6)
                {
                    hh=dateArray[1].substring(0,2)
                    mm=dateArray[1].substring(2,4)
                    ss=dateArray[1].substring(4,6)
                    dateToReturn+=" "+hh+":"+mm
                }
            }

            return dateToReturn
            
        }
     
    }
    else
    {
    }
    return ""
}

export function ISODatetoHumanWithoutTime(date)
{
    if(date!=null && date!=undefined && typeof(date)=="string")
    {
        var isoDate = ISODatetoHuman(date)
        var splitDate = isoDate.split(' ')
        if(isValidResultArray(splitDate) && splitDate.length==2)
        {
            return splitDate[0]
        }
        
    }
    else
    {
    }
    return ""
}

export function ISODatetoHumanISO(date)
{
    if(date!=null && date!=undefined && typeof(date)=="string")
    {
        var dateToReturn=""
        var dateArray = date.split('T')
        if(dateArray!=null && Array.isArray(dateArray) && dateArray.length>0)
        {
            var year=""
            var month=""
            var date=""
            var hh=""
            var mm=""
            var ss=""
            
            if(dateArray[0].length==8)
            {
                year=dateArray[0].substring(0,4)
                month=dateArray[0].substring(4,6)
                date=dateArray[0].substring(6,8)

                dateToReturn= year+"-"+month+"-"+date
            }
            if(dateArray.length>1)
            {
                if(dateArray[1].length==6)
                {
                    hh=dateArray[1].substring(0,2)
                    mm=dateArray[1].substring(2,4)
                    ss=dateArray[1].substring(4,6)
                    dateToReturn+=" "+hh+":"+mm
                }
            }

            return dateToReturn
            
        }
     
    }
    else
    {
    }
    return ""
}


export function dueDatetoUnixStamp(dueDate)
{
    return moment(dueDate, 'D/M/YYYY H:mm').unix();

}

export function timeDifferencefromNowinWords(date)
{
    var timeDifference=Math.floor((dueDatetoUnixStamp(date) - Math.floor(Date.now() / 1000))/86400)
    var timeDifferenceStatement=""
    if(isNaN(timeDifference))
    {
        timeDifferenceStatement =""
    }
    else
    {
        if(timeDifference<0)
        {
            timeDifferenceStatement="("+(timeDifference*-1)+" "+i18next.t("DAYS")+" "+ i18next.t("AGO")+")"
        }else if(timeDifference ==0 ){
            timeDifferenceStatement="("+i18next.t("TODAY")+")"
        }
        else{
            timeDifferenceStatement="("+ i18next.t("IN") +" "+(timeDifference)+" "+i18next.t("DAYS_DUE")+")"
        }
        
    }

    return timeDifferenceStatement

}
export function timeDifferencefromNowinWords_FromUnixSeconds(unixTime){
    var timeDifference=Math.floor((unixTime - Math.floor(Date.now() / 1000))/86400)
    var timeDifferenceStatement=""
    if(isNaN(timeDifference))
    {
        timeDifferenceStatement =""
    }
    else
    {
        if(timeDifference<0)
        {
            timeDifferenceStatement="("+(timeDifference*-1)+" "+i18next.t("DAYS")+" "+ i18next.t("AGO")+")"
        }else if(timeDifference ==0 ){
            timeDifferenceStatement="("+i18next.t("TODAY")+")"
        }
        else{
            timeDifferenceStatement="("+ i18next.t("IN") +" "+(timeDifference)+" "+i18next.t("DAYS_DUE")+")"
        }
        
    }

    return timeDifferenceStatement

}

export function fixNullDate(dateToCheck, newDate){
    if(dateToCheck){

    }
}

export function timeDifferencefromNowinWords_Generic(date)
{
    var timeDifference=Math.floor((moment(date).unix() - Math.floor(Date.now() / 1000))/86400)
    var timeDifferenceStatement=""
    if(isNaN(timeDifference))
    {
        timeDifferenceStatement =""
    }
    else
    {
        if(timeDifference<0)
        {
            timeDifferenceStatement="("+(timeDifference*-1)+" "+i18next.t("DAYS")+" "+ i18next.t("AGO")+")"
        }else if(timeDifference ==0 ){
            timeDifferenceStatement="("+i18next.t("TODAY")+")"
        }
        else{
            timeDifferenceStatement="("+ i18next.t("IN") +" "+(timeDifference)+" "+i18next.t("DAYS_DUE")+")"
        }
        
    }

    return timeDifferenceStatement

}

export function getRandomColourCode()
{
    var colour_code="#"+Math.floor(Math.random()*16777215).toString(16)
    return colour_code
}
export const findPath = (ob, key) => {
    const path = [];
    const keyExists = (obj) => {
      if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
        return false;
      }
      else if (obj.hasOwnProperty(key)) {
        return true;
      }
      else if (Array.isArray(obj)) {
        let parentKey = path.length ? path.pop() : "";
  
        for (let i = 0; i < obj.length; i++) {
          path.push(`${parentKey}[${i}]`);
          const result = keyExists(obj[i], key);
          if (result) {
            return result;
          }
          path.pop();
        }
      }
      else {
        for (const k in obj) {
          path.push(k);
          const result = keyExists(obj[k], key);
          if (result) {
            return result;
          }
          path.pop();
        }
      }
      return false;
    };
  
    keyExists(ob);
  
    return path.join(".");
  }

  export function objectArrayHasKey(object, searchKey)
  {
      for (const key in object) {
          if(key==searchKey)
          {
              return true
          }
      }
  
      return false
  }
  
  export function displayErrorMessageFromAPIResponse(body)
  {
    var message = getMessageFromAPIResponse(body)
    if(varNotEmpty(message) && message!="")
    {
        toast.error(i18next.t(message))

    }else{
        toast.error(i18next.t("ERROR_GENERIC"))
    }
    
  }

  export function getTomorrow()
  {
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate
  }

  export function isValidTime(time)
  {
    return (moment(time, 'HH:mm', true).isValid() || moment(time, 'H:m', true).isValid() || moment(time, 'H:mm', true).isValid() || moment(time, 'H:mm', true).isValid())
  }

  export function isDateValid(dateStr) {
    const isValid =  !isNaN(new Date(dateStr));
    // console.log("dateStr", dateStr, isValid)
    return isValid
  }