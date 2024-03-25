import { Loading } from "@/components/common/Loading"
import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper"
import { getI18nObject } from "@/helpers/frontend/general"
import { SETTING_NAME_DATE_FORMAT, SETTING_NAME_TIME_FORMAT } from "@/helpers/frontend/settings"
import { fetchLatestEventsV2,  refreshCalendarListV2 } from "@/helpers/frontend/sync"
import { useSetAtom } from "jotai"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore"


const i18next = getI18nObject()
export default function SetupPage() {
    /**
     * Jotai
     */
    const setDateFormat = useSetAtom(currentSimpleDateFormatAtom)
    const setTimeFormat = useSetAtom(currentSimpleTimeFormatAtom)
    const [isLoading, setIsLoading] = useState(true)
    const [currentWork, setCurrentWork] = useState("Fetching events and tasks...")
    const router= useRouter()
    const setupEverything = useCallback(async() =>{

        let isMounted =true
        if(isMounted){

            await refreshCalendarListV2
            await fetchLatestEventsV2()
            setCurrentWork("Fetching settings...")
            await SettingsHelper.getAllFromServerAndSave()
            const dateFormat = localStorage.getItem(SETTING_NAME_DATE_FORMAT)
            if(dateFormat){
                setDateFormat(dateFormat)
            }
            const timeFormat = localStorage.getItem(SETTING_NAME_TIME_FORMAT)
            if(timeFormat){
                setTimeFormat(timeFormat)
            }
            redirect()
        }
        return ()=>{
            isMounted=false
        }
    },[])
    useEffect(()=>{
        let isMounted =true
        if(isMounted){
            setupEverything()
        }
        return ()=>{
            isMounted=false
        }

    },[setupEverything])


  
    const redirect =() =>{
        setIsLoading(false)
        let redirectURL ="/"
        if(window!=undefined){
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            let redirectTo = params.get('redirect')
            if(redirectTo!=null && redirectTo!=undefined && redirectTo!="")
            {
                redirectURL+=`?redirect=${redirectTo}`
            }
            router.push(redirectURL)
        }

    }
    return(
        <>
        <Head>
          <title>{`${i18next.t("APP_NAME_TITLE")} - ${i18next.t("SETUP")}`}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container-fluid">
        <div className="row text-center align-items-center vh-100">
            <div >
                <Image alt='Logo' src="/logo.png" width={100} height={100} />
                <br />
                <br />
                {isLoading ? 
                (   <>
                        <h2>{i18next.t("SETTING_UP")}</h2>
                        {currentWork}
                        <Loading />
                    </>
                    ):
                (<h2>{i18next.t("DONE")}</h2>)}
                
            </div>

        </div>
        </div>
        </>
    )
}
