import { AVAILABLE_LANGUAGES } from "@/config/constants";
import Cookies from 'js-cookie'
import { addTrailingSlashtoURL } from "../general";

// import *  as translations_en from '@/i18n/en.json'
// import * as translations_de from '@/i18n/de.json'
const defaultLanguage ="en"
export const LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE="NEXT_LOCALE"
// export function getI18Object_Multilanguages(){
//     const currentLang = getCurrentLanguage()
//      i18next
//         .init({
//             lng: currentLang,
//             returnNull: false,
//             debug: false,
//             resources: {
//                 en:{
//                     translation:translations_en
//                 },
//                 de:{
//                     translation:translations_de
//                 }
//             }
//           });

//       return i18next
// }
export function getCurrentLanguage(){
 if(typeof(window)!="undefined"){
    const lang=  Cookies.get(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE)
    if(lang){
        return lang
    }
 }

 return getDefaultLanguage()
}

export function getDefaultLanguage(){
    return defaultLanguage
}
 export function setCurrentLanguage(lang){
    if(typeof(window)!="undefined"){
        Cookies.set(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE,lang)
    }  
}
export function getAvailableLanguages(){

    return AVAILABLE_LANGUAGES
}

export function dummyTranslationFunction(value){
    return value
}

export function appendLanguageToURL(url, newLang ){

    const urlObj = new URL(url)

    const urlPath = urlObj.pathname
    const urlHostname = urlObj.host
    
    // console.log("urlPath", urlPath)
    let newUrl=addTrailingSlashtoURL(url)
    let newPath = urlPath
    const langFound = langAlreadyinURL(newUrl)
    console.log("langFound", langFound)
    if(langFound){
        //Url Path already has a lang. We must remove it, if it is not the same as the new lang.
        newUrl = newUrl.replace(`/${langFound}/`,`/${newLang}/`)
        
    }else{
        newUrl=`${urlObj.protocol}//${urlObj.host}/${newLang}${urlPath}`
    }
    
    console.log("newUrl", newUrl)
    return newUrl
}

export function langAlreadyinURL(url){
    let langFound =""
    const urlToCheck = addTrailingSlashtoURL(url)
    for(const i in AVAILABLE_LANGUAGES){
        // console.log("`/${AVAILABLE_LANGUAGES[i]}/`", urlToCheck, urlToCheck.includes(`/${AVAILABLE_LANGUAGES[i]}/`))
        if(urlToCheck.includes(`/${AVAILABLE_LANGUAGES[i]}/`)){
            langFound = AVAILABLE_LANGUAGES[i]
            break;
        }
    }

    return langFound

}

export function shouldRedirectWithLang(url, newLang){

    const langInURL = langAlreadyinURL(url)
    console.log("langInURL" ,langInURL, )
    if(!langInURL)    {
        return true
    }
    const langDifferent = (newLang ==langInURL)
    console.log("----", langDifferent ,"newLang ", newLang)
    return !langDifferent

}