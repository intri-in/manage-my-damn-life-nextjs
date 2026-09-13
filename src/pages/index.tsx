import Head from 'next/head'
import  AppBarGeneric  from '@/components/common/AppBar'
import { useEffect, useState, useRef } from 'react'
import { useSession, signIn } from "next-auth/react"
import { nextAuthEnabled } from '@/helpers/thirdparty/nextAuth'
import { checkLogin_InBuilt } from '@/helpers/frontend/user'
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
import { AVAILABLE_LANGUAGES } from '@/config/constants'
import { EmptyPageBeforeLogin } from '@/components/common/EmptyPageBeforeLogin'
import { useAuthGuard } from '@/helpers/frontend/hooks/useAuthGuard'

export default function HomePage(props) {
const isLoggedIn = useAuthGuard("/", props.nextAuthEnabled);
  const { t } = useTranslation()

  useCustomTheme()
   

  if(!isLoggedIn) return (<EmptyPageBeforeLogin />)

    

  
    const title = `${t("APP_NAME_TITLE")} - ${t("HOME")}`
    return(
        <div   >
        <Head>
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  />
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
      ...(await serverSideTranslations(locale, ["common"], null, AVAILABLE_LANGUAGES)),
      nextAuthEnabled: await nextAuthEnabled()
      // Will be passed to the page component as props
    },
  }
}