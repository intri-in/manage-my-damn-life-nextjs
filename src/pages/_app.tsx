import NextNProgress from 'nextjs-progressbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Toastify } from '@/components/Generic';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/global.css'
import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from 'react';
import { initAutoSync, shouldSync } from '@/helpers/frontend/sync';
import { UserConfig } from 'next-i18next';
import { appWithTranslation } from 'next-i18next';

import * as nextI18NextConfig from '@/../next-i18next.config'

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
};
function App({ Component, pageProps: {session, ...pageProps }}) {
  const [counter, setCounter] = useState(0)
  useEffect(()=>{
    if(shouldSync()){
      initAutoSync()
      setCounter(0)
    }
    // console.log(counter)
    const timeOut = setTimeout(()=>{
      setCounter(prev=>prev+1)
    }, 1000)

    return () =>{
      clearInterval(timeOut)
    }
  },[counter])

  return (
        <SessionProvider session={session} refetchOnWindowFocus={true}>
          <NextNProgress  color="#ff0000"  height={5} options={{ showSpinner: false }}/>
            <Component {...pageProps} />
          <Toastify />
        </SessionProvider>
    )
}

export default appWithTranslation(App,emptyInitialI18NextConfig)