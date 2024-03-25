import Head from 'next/head'
import  AppBarGeneric  from '@/components/common/AppBar'
import { useEffect, useState, useRef } from 'react'
import { getI18nObject } from '@/helpers/frontend/general'
import CombinedView from '@/components/page/CombinedView'
import { useSession, signIn } from "next-auth/react"
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth'
import { checkLogin_InBuilt, logoutUser_withRedirect } from '@/helpers/frontend/user'
import { varNotEmpty } from '@/helpers/general'
import { useRouter } from 'next/router'
import { getIfInstalled, installCheck } from '@/helpers/install'
import { useCustomTheme } from '@/helpers/frontend/theme'
import { CombinedViewFunctional } from '@/components/page/CombinedView/CombinedViewFunctional'
import { TaskEditorViewManager } from '@/components/tasks/TaskEditorSupport/TaskEditorViewManager'
import { TaskListFrameWork } from '@/components/tasks/views/TaskListFrameWork'
import { EventEditorViewManager } from '@/components/events/EventEditorViewManager'

const i18next = getI18nObject()
export default function HomePage() {
  const { data: session, status } = useSession()  
  const [updated, setUpdated]=useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [installChecked, setInstallChecked] = useState(false)
  const onSynComplete = () =>{
      var updated = Math.floor(Date.now() / 1000)
      setUpdated(updated)
    }

  //const [finalOutput, setFinalOutput] =useState()
  // useEffect(()=>{
     

  //   // if(!loginChecked.current){
  //   //   loginChecked.current=true
  //   //   const checkAuth = async() =>{
  //   //     const auth = await isUserLoggedIn()
  //   //     if(auth){
  //   //       setUserAuthenticated(true)
  //   //     }
  //   //   }
  //   //   checkAuth()
  //   // }
    
  //   // }, [userAuthenticated])
  const router = useRouter()
  useCustomTheme()

   

    useEffect(() =>{
      async function checkLogin(){
        if(await nextAuthEnabled()){
          if (status=="unauthenticated" ) {
            signIn()
          } 
        }else{
          // Check login using inbuilt function.
          checkLogin_InBuilt(router)
        }
      }
       checkLogin() 
      }, [status, router])
    

  

    return(
        <div   >
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")} - {i18next.t("HOME")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  onSynComplete={onSynComplete} isSyncing={isSyncing}/>
        <div className='container-fluid'>
          <CombinedViewFunctional />
          <TaskEditorViewManager />
          <EventEditorViewManager />
         
        </div>     
        </div>

    )
}