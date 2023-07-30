import SettingsPage from "@/components/page/SettingsPage/SettingsPage";
import { checkLogin_InBuilt, logoutUser_withRedirect } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function Settings(){
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() =>{
      
      if(nextAuthEnabled()){
        if (status=="unauthenticated" ) {
          signIn()
        }
      }else{
        // Check login using inbuilt function.

        checkLogin_InBuilt(router, '/accounts/settings')
      }
    }, [status,router])
    

     
  
    
    return(
        <>
        <SettingsPage  />
        </>
    )
}