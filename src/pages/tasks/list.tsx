import TaskViewList from "@/components/page/TaskViewPage/TaskViewList";
import { TaskViewListWithStateManagement } from "@/components/page/TaskViewPage/TaskViewListWithStateManagement";
import { TaskEditorViewManager } from "@/components/tasks/TaskEditorSupport/TaskEditorViewManager";
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
    

     
  
    
    return(
        <>
        <TaskViewListWithStateManagement />
        <TaskEditorViewManager />
        </>
    )
}