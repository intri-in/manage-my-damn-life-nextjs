'use client'
import CalendarView from "@/components/page/CalendarViewPage/CalendarView";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function CalendarViewPage(){
    const { data: session, status } = useSession()
    const router = useRouter()
    useCustomTheme()

    useEffect(() =>{
      async function checkAuth(){
        
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          }
        }else{
          // Check login using inbuilt function.
  
          checkLogin_InBuilt(router, "/calendar/view")
        }
      }
      checkAuth()
    }, [status,router])
    

     
  
    
    return(
        <>
        <CalendarView />
        </>
    )
}