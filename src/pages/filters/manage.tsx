import CalendarView from "@/components/page/CalendarViewPage/CalendarView";
import ManageFilters from "@/components/page/ManageFiltersPage/ManageFilters";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function ManageViewPage(){
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() =>{
      async function checkAuth(){
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }
        }else{
          // Check login using inbuilt function.
  
          checkLogin_InBuilt(router, "/filters/manage")
        }

      }
      checkAuth()
    }, [status, router])
    

     
  
    
    return(
        <>
        <ManageFilters />
        </>
    )
}