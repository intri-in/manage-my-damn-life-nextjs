import Head from 'next/head'
import  AppBarGeneric  from '@/components/common/AppBar'
import { useEffect, useState, useRef } from 'react'
import { useSession, signIn } from "next-auth/react"
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth'
import { checkLogin_InBuilt, logoutUser_withRedirect } from '@/helpers/frontend/user'
import { useRouter } from 'next/router'
import { getIfInstalled, installCheck } from '@/helpers/install'
import { useCustomTheme } from '@/helpers/frontend/theme'
import { CombinedViewFunctional } from '@/components/page/CombinedView/CombinedViewFunctional'
import { TaskEditorViewManager } from '@/components/tasks/TaskEditorSupport/TaskEditorViewManager'
import { TaskListFrameWork } from '@/components/tasks/views/TaskListFrameWork'
import { EventEditorViewManager } from '@/components/events/EventEditorViewManager'
import { GlobalViewManager } from '@/components/common/GlobalViewManager/GlobalViewManager'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getCurrentLanguage } from '@/helpers/frontend/translations'

export default function HomePage() {
  const { data: session, status } = useSession()  
  const [updated, setUpdated]=useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [installChecked, setInstallChecked] = useState(false)
  const { t, i18n } = useTranslation()
  // useEffect(()=>{
  //   i18n.changeLanguage(getCurrentLanguage())
  // },[])
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
    

  
    const title = `${t("APP_NAME_TITLE")} - ${t("HOME")}`
    return(
        <div   >
        <Head>
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  onSynComplete={onSynComplete} isSyncing={isSyncing}/>
        <div className='container-fluid'>
          <CombinedViewFunctional />
          <GlobalViewManager />         
        </div>     
        </div>

    )
}


export async function getStaticProps({ locale}) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], null, ["en","de"])),
      // Will be passed to the page component as props
    },
  }
}