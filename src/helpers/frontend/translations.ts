import { AVAILABLE_LANGUAGES } from "@/config/constants";
import i18next from "i18next";
import *  as translations_en from '@/i18n/en.json'
import * as translations_de from '@/i18n/de.json'
const defaultLanguage ="en"
export const LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE="CURRENT_LANGUAGE"
export function getI18Object_Multilanguages(){
    const currentLang = getCurrentLanguage()
     i18next
        .init({
            lng: currentLang,
            fallbackLng: defaultLanguage,
            returnNull: false,
            debug: false,
            resources: {
                en:{
                    translation:translations_en
                },
                de:{
                    translation:translations_de
                }
            }
          });

      return i18next
}
export function getCurrentLanguage(){
 if(typeof(window)!="undefined"){
    const lang=  localStorage.getItem(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE)
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
        localStorage.setItem(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE, lang)
     }  
}
export function getAvailableLanguages(){

    return AVAILABLE_LANGUAGES
}