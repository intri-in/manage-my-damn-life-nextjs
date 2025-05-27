import { GlobalViewManager } from "@/components/common/GlobalViewManager/GlobalViewManager";
import { EventEditorViewManager } from "@/components/events/EventEditorViewManager";
import TaskViewList from "@/components/page/TaskViewPage/TaskViewList";
import { TaskViewListWithStateManagement } from "@/components/page/TaskViewPage/TaskViewListWithStateManagement";
import { TaskEditorViewManager } from "@/components/tasks/TaskEditorSupport/TaskEditorViewManager";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { PAGE_VIEW_JSON } from "@/helpers/viewHelpers/pages";
import { useSetAtom } from "jotai";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { calDavObjectAtom, currentPageTitleAtom, filterAtom, updateViewAtom } from "stateStore/ViewStore";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AVAILABLE_LANGUAGES } from "@/config/constants";


export default function TaskListPage(){
    const { data: session, status } = useSession()
    const router = useRouter()
    useCustomTheme()
     /**
     * Jotai
     */
     const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
     const setFilterAtom = useSetAtom(filterAtom)
     const setCalDavAtom = useSetAtom(calDavObjectAtom)
     const setUpdateView= useSetAtom(updateViewAtom)
     const [urlParsed, setURLPased] = useState(false)
    const {t} = useTranslation()
    useEffect(() =>{
      let isMounted = true
      if(isMounted)
      {
        const checkAuth = async () =>{
          
          if(await nextAuthEnabled()){
            if (status=="unauthenticated" ) {
              signIn()
            }
          }else{
            // Check login using inbuilt function.
    
            checkLogin_InBuilt(router, "/tasks/list")
          }
        }
        checkAuth()
  
      }
      return ()=>{
        isMounted = false
      }

    }, [status,router])
    
     
    useEffect(()=>{


          if(window!=undefined && !urlParsed){
            setURLPased(true)
            
              const queryString = window.location.search;
              const params = new URLSearchParams(queryString);
              const pageName = params.get('name')
              const type = params.get('type')

              console.log("pageName",urlParsed, pageName ,PAGE_VIEW_JSON[pageName!])
              if(pageName){
      
                  setFilterAtom(PAGE_VIEW_JSON[pageName])
                  setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
                  setCurrentPageTitle(t(pageName).toString())
              }

              if(type){
                switch(type.toUpperCase()){
                  case "CAL":
                    const caldav_accounts_id = params.get('caldav_accounts_id')
                    const calendars_id = params.get('calendars_id')
                    if(caldav_accounts_id && calendars_id){

                      setCurrentPageTitle("")
                      setFilterAtom({})
                      setCalDavAtom({caldav_accounts_id: parseInt(caldav_accounts_id), calendars_id: parseInt(calendars_id)})
                    }
                    break;
                  case "FILTER":
                    const q=params.get('q')
                    const filter_name=params.get('filter_name')
                    if(filter_name && q){

                      setCurrentPageTitle(filter_name)
                      setFilterAtom(JSON.parse(q))
                      setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
                    }
                    break;
                  case "LABEL":
                    const label_name = params.get('label_name')
                    if(label_name){
                      const currentFilter = {label: [label_name]}
                      const title = `${t("LABEL")}: ${label_name}`
                      setCurrentPageTitle(title)
                      setFilterAtom({logic: "or", filter: currentFilter})
                      setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
              
                    }
                    break;
                }
              }
          }
      
    
  },[setCalDavAtom, setCurrentPageTitle, setFilterAtom, urlParsed])


    const output = urlParsed ? <TaskViewListWithStateManagement />: null
    return(
        <>
        {output}
        <GlobalViewManager />
        </>
    )
}

export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
      // Will be passed to the page component as props
    },
  }
}
