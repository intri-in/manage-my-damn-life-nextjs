import TaskViewList from "@/components/page/TaskViewPage/TaskViewList";
import { useCustomTheme } from "@/helpers/frontend/theme";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function TaskListPage(){
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
  
          checkLogin_InBuilt(router, "/tasks/list")
        }
      }
      checkAuth()
    }, [status,router])
    

     
  
    
    return(
        <>
        <TaskViewList />
        </>
    )
}