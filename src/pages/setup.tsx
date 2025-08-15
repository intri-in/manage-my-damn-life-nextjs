import { Loading } from "@/components/common/Loading"
import SettingsHelper from "@/helpers/frontend/classes/SettingsHelper"
import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { db } from "@/helpers/frontend/dexie/dexieDB"
import { checkifCurrentUserInDexie } from "@/helpers/frontend/dexie/users_dexie"
import { SETTING_NAME_DATE_FORMAT, SETTING_NAME_TIME_FORMAT } from "@/helpers/frontend/settings"
import { fetchLatestEventsV2,  fetchLatestEvents_withoutCalendarRefresh,  refreshCalendarListV2 } from "@/helpers/frontend/sync"
import { logoutUser } from "@/helpers/frontend/user"
import { useSetAtom } from "jotai"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import { toast } from "react-toastify"
import { currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from "stateStore/SettingsStore"
import { updateCalendarViewAtom, updateViewAtom } from "stateStore/ViewStore"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { AVAILABLE_LANGUAGES } from "@/config/constants"
import { setupWebCalDataFromServer } from "@/helpers/frontend/webcals"
const SESSION_IS_SETTING_UP="SESSION_IS_SETTING_UP"

export default function SetupPage() {
    /**
     * Jotai
     */

    const setDateFormat = useSetAtom(currentSimpleDateFormatAtom)
    const setTimeFormat = useSetAtom(currentSimpleTimeFormatAtom)
    const [isLoading, setIsLoading] = useState(true)
    const [currentWork, setCurrentWork] = useState("Fetching events and tasks...")
    const router= useRouter()
    const {t} = useTranslation()
    const effectRan = useRef(false);

    const setupEverything = async () => {

            setCurrentWork("Fetching settings...")
            await SettingsHelper.getAllFromServerAndSave()
            // await setupWebCalDataFromServer()
            setCurrentWork("Fetching events and data...")
        
            // await fetchLatestEventsV2()
            //Open dexie db to make sure that any required transactions are committed automatically.
            db.open().catch (function (err) {
                toast.error('Failed to open db: ' + (err.stack || err));
            });
            //First we check if the user already has data in dexie
            const arrayFromDexie = await getCalDAVSummaryFromDexie()
            const fetch = (arrayFromDexie && Array.isArray(arrayFromDexie) && arrayFromDexie.length>0) ? false: true
                //User already has data in dexie. 
                
            if(fetch) await fetchLatestEventsV2()
            if (fetch) await setupWebCalDataFromServer()
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
    useEffect(()=>{
        let isMounted =true
      
        
        if (!effectRan.current) {

                checkifCurrentUserInDexie().then((goOn) =>{
                    if(goOn){
                       setupEverything()
                    }else{
                        if(window!=undefined){
                            setIsLoading(false)
                            logoutUser()
                            router.push('/login')    
                        }
                    }
    
                }).catch(e=>{
                    console.error("checkifCurrentUserInDexie",e)
                    setCurrentWork(e)
                })
                
            }
        
            return () => {effectRan.current = true;}

    },[])


  
    const redirect =() =>{
        setIsLoading(false)
        let redirectURL ="/tasks/list/"
        if(window!=undefined){
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            let redirectTo = params.get('redirect')
            if(redirectTo!=null && redirectTo!=undefined && redirectTo!="")
            {
                redirectURL=`${redirectTo}`
            }
            router.push(redirectURL)
        }

    }
    return(
        <>
        <Head>
          <title>{`${t("APP_NAME_TITLE")} - ${t("SETUP")}`}</title>
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
                        <h2>{t("SETTING_UP")}</h2>
                        {currentWork}
                        <Loading />
                    </>
                    ):
                (<h2>{t("DONE")}</h2>)}
                
            </div>

        </div>
        </div>
        </>
    )
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
        },
    };
}