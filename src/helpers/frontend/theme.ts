import Cookies from 'js-cookie'
import { DARK_MODE_COOKIE_NAME } from './cookies'
import { useEffect } from 'react'
export const DEFAULT_THEME =" light"
export function getThemeMode(){
    const mode = Cookies.get(DARK_MODE_COOKIE_NAME)
    return mode ?? "light"
}
export function setThemeMode(mode){
    Cookies.set(DARK_MODE_COOKIE_NAME, mode,  { expires: 3650 })
}

export function isDarkModeEnabled(){
    return getThemeMode()=="dark" ? true : false
}

export function useCustomTheme(){
    const themeMode = getThemeMode()
    useEffect(() =>{
        let isMounted =true
        if(isMounted){
          document.documentElement.setAttribute("data-bs-theme", getThemeMode())
    
        }
        return () =>{
          isMounted = false
      }
      }, [themeMode])

    
}