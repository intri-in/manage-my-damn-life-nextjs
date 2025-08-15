import { EmptyPageBeforeLogin } from "@/components/common/EmptyPageBeforeLogin";
import CalendarView from "@/components/page/CalendarViewPage/CalendarView";
import ManageFilters from "@/components/page/ManageFiltersPage/ManageFilters";
import { AVAILABLE_LANGUAGES } from "@/config/constants";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function ManageViewPage(){
  const { data: session, status } = useSession() 
  const [isloggedIn, setIsloggedIn] = useState(false)
  const router = useRouter()
  useCustomTheme()
  useEffect(() =>{

    let isMounted =true
    async function checkAuth(){
      
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }else{
              setIsloggedIn(true)
          }
        }else{
          // Check login using inbuilt function.
          setIsloggedIn(await checkLogin_InBuilt(router,"/accounts/caldav"))
        }
      }

      if(isMounted){

        checkAuth()
      }
      return () =>{
        isMounted = false
    }
  }, [status, router])

    if(!isloggedIn) (<EmptyPageBeforeLogin />)   
    return(
        <>
        <ManageFilters />
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