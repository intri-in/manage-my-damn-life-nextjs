import TaskViewList from "@/components/page/TaskViewPage/TaskViewList";
import { checkLogin_InBuilt } from "@/helpers/frontend/user";
import { nextAuthEnabled } from "@/helpers/thirdparty/nextAuth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function TaskListPage(){
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() =>{
      
      if(nextAuthEnabled()){
        if (status=="unauthenticated" ) {
          signIn()
        }
      }else{
        // Check login using inbuilt function.

        checkLogin_InBuilt(router, "/tasks/list")
      }
    }, [status,router])
    

     
  
    
    return(
        <>
        <TaskViewList />
        </>
    )
}