import Head from 'next/head'
import TaskList from '@/components/tasks/TaskList'
import  AppBarGeneric  from '@/components/common/AppBarGeneric'
import { Col, Row } from 'react-bootstrap'
import { getTodaysDateUnixTimeStamp, varNotEmpty } from '@/helpers/general'
import DashboardView from '@/components/fullcalendar/DashboardView'
import AddTask from '@/components/common/AddTask/AddTask'
import { PRIMARY_COLOUR, SECONDARY_COLOUR } from '@/config/style'
import { Component, useEffect, useState } from 'react'
import { getI18nObject } from '@/helpers/frontend/general'
import { MYDAY_LABEL } from '@/config/constants'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { AiOutlineMenuUnfold } from 'react-icons/ai'
import Script from 'next/script'
import HomeTasks from '@/components/Home/HomeTasks/HomeTasks'
import CombinedView from '@/components/page/CombinedView'
import { Loading } from '@/components/common/Loading'

const i18next = getI18nObject()

export default function HomePage() {
  const [updated, setUpdated]=useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  const onSynComplete = () =>{
      var updated = Math.floor(Date.now() / 1000)
      setUpdated(updated)
    }

  const [finalOutput, setFinalOutput] =useState(<CombinedView updated={updated} onSynComplete={onSynComplete} />)

    useEffect(()=>{
    })
    return(
        <>
        <Head>
          <title>{i18next.t("APP_NAME_TITLE")} - {i18next.t("TASKS")}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppBarGeneric  onSynComplete={onSynComplete} isSyncing={isSyncing}/>
        <div className='container-fluid'>
            {finalOutput}
        </div>     
        </>

    )
}