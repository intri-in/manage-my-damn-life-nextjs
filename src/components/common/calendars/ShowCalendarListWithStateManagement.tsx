import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { Col, ListGroup, Row } from "react-bootstrap"
import { AiOutlinePlusCircle } from "react-icons/ai"
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import AddNewCalendar from "./AddNewCalendar"
import { toast } from "react-toastify"
import Link from "next/link"
import { FaExternalLinkAlt } from "react-icons/fa"
import { useTranslation } from "next-i18next"

export const ShowCalendarListWithStateManagement = ({postClick}: {postClick: Function}) =>{
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)
    /**
     * Local State
     */

    const [finalOutput, setFinalOutput] = useState<JSX.Element[] | JSX.Element>([])
    const [update, setUpdate] = useState(Date.now())
    const {t} = useTranslation()


    
    const calendarNameClicked = (caldav_accounts_id, calendars_id)=>{
        setCurrentPageTitle("")
        setFilterAtom({})
        setCalDavAtom({caldav_accounts_id: caldav_accounts_id, calendars_id: calendars_id})
        postClick()
    }

    const renderCalendarList = async (caldavSummary) =>{

        const addCalendarResponse = (response) =>{
            if(response!=null && response.success!= null && response.success==true && response.data.message[0].status>=200 && response.data.message[0].status<300)
            {
                // Successful creation.
                toast.success(t("CALENDAR_ADDED_SUCCESSFULLY"))
                getCaldavAccountsfromDexie()
            }
            else
            {
                getCaldavAccountsfromDexie()
                toast.error(t("ERROR_ADDING_CALENDER"))
                console.log(response)
            }
            
    
        }
    
        const showAddCalendarScreen = (caldav_account)=>{
              
            setFinalOutput(<AddNewCalendar i18next={t} onClose={()=>setUpdate(Date.now())} caldav_accounts_id={caldav_account.caldav_accounts_id} onResponse={addCalendarResponse} accountName={caldav_account.name} />)
        }

    
        let finalOutput : JSX.Element[]= []
        for(let j=0; j<caldavSummary.length; j++)
        {
            let accountInfo=(
                <Row>
                    <Col className="defaultTex">
                        {caldavSummary[j].name}

                    </Col>
                    <Col style={{textAlign: "right"}}><AiOutlinePlusCircle onClick={(e)=> showAddCalendarScreen(caldavSummary[j])} /></Col>
                </Row>
            )
            let calendars: JSX.Element[]=[]
            if(!caldavSummary[j].calendars){
                continue
            }
            for (const i in caldavSummary[j].calendars)
            {
                let href="/tasks/list?caldav_accounts_id="+caldavSummary[j].caldav_accounts_id+"&&calendars_id="+caldavSummary[j].calendars[i].calendars_id
                let key=caldavSummary[j].caldav_accounts_id+"-"+caldavSummary[j].calendars[i].calendars_id
                // console.log(key)
                //<a style={{textDecoration: 'none'}} href={href}>
                let cal=(<ListGroup.Item key={key} className="textDefault" onClick={()=> calendarNameClicked(caldavSummary[j].caldav_accounts_id, caldavSummary[j].calendars[i].calendars_id)} style={{ borderColor:caldavSummary[j].calendars[i].calendarColor, borderLeftWidth: 10, marginBottom:10 }}>
                    <Row>
                        <Col xs={10}>
                            {caldavSummary[j].calendars[i].displayName}
                        </Col>
                        <Col xs={2}> <Link target="_blank" href={`?type=CAL&&caldav_accounts_id=${caldavSummary[j].caldav_accounts_id}&&calendars_id=${caldavSummary[j].calendars[i].calendars_id}`}><FaExternalLinkAlt className="textDefault" /> </Link>
</Col>
                        </Row></ListGroup.Item>)
                calendars.push(cal)                    

            }
            finalOutput.push(<div key={caldavSummary[j].caldav_accounts_id}>{accountInfo}<ListGroup style={{marginBottom: 10}}>{calendars}</ListGroup> </div>)
            setFinalOutput(finalOutput)
        }

    }

    const getCaldavAccountsfromDexie =async () => {
        const caldavSummary = await getCalDAVSummaryFromDexie()
        renderCalendarList(caldavSummary)
    }





    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            getCaldavAccountsfromDexie()
        }
        return ()=>{
            isMounted = false
        }
    }, [update])



    return(
    <>
    {finalOutput}
    </>
    )
}