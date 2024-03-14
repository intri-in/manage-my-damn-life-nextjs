import { getCalDAVSummaryFromDexie } from "@/helpers/frontend/dexie/caldav_dexie"
import { getI18nObject } from "@/helpers/frontend/general"
import { useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { Col, ListGroup, Row } from "react-bootstrap"
import { AiOutlinePlusCircle } from "react-icons/ai"
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import AddNewCalendar from "./AddNewCalendar"
import { toast } from "react-toastify"

const i18 = getI18nObject()
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

    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            getCaldavAccountsfromDexie()
        }
        return ()=>{
            isMounted = false
        }
    }, [])

    const getCaldavAccountsfromDexie = async () =>{
        const caldavSummary = await getCalDAVSummaryFromDexie()
        renderCalendarList(caldavSummary)
    }

    const showAddCalendarScreen = (caldav_account) =>{
              
        setFinalOutput(<AddNewCalendar onClose={()=>getCaldavAccountsfromDexie()} caldav_accounts_id={caldav_account.caldav_accounts_id} onResponse={addCalendarResponse} accountName={caldav_account.name} />)
    }

    const addCalendarResponse = (response) =>{
        if(response!=null && response.success!= null && response.success==true && response.data.message[0].status>=200 && response.data.message[0].status<300)
        {
            // Successful creation.
            toast.success("Calendar added successfully.")
        }
        else
        {
            toast.error("Calendar couldn't be added. Check the console log.")
            console.log(response)
        }
        getCaldavAccountsfromDexie()

    }
    const calendarNameClicked = (caldav_accounts_id, calendars_id) =>{
        setCurrentPageTitle("")
        setFilterAtom({})
        setCalDavAtom({caldav_accounts_id: caldav_accounts_id, calendars_id: calendars_id})
        postClick()
    }
    const renderCalendarList = async (caldavSummary) =>{
        let finalOutput : JSX.Element[]= []
        for(let j=0; j<caldavSummary.length; j++)
        {
            var accountInfo=(
                <Row>
                    <Col className="defaultTex">
                        {caldavSummary[j].name}

                    </Col>
                    <Col style={{textAlign: "right"}}><AiOutlinePlusCircle onClick={(e)=> showAddCalendarScreen(caldavSummary[j])} /></Col>
                </Row>
            )
            var calendars: JSX.Element[]=[]
            if(!caldavSummary[j].calendars){
                continue
            }
            for (const i in caldavSummary[j].calendars)
            {
                var href="/tasks/list?caldav_accounts_id="+caldavSummary[j].caldav_accounts_id+"&&calendars_id="+caldavSummary[j].calendars[i].calendars_id
                var key=caldavSummary[j].caldav_accounts_id+"-"+caldavSummary[j].calendars[i].calendars_id
                // console.log(key)
                //<a style={{textDecoration: 'none'}} href={href}>
                var cal=(<ListGroup.Item key={key} className="textDefault" onClick={()=> calendarNameClicked(caldavSummary[j].caldav_accounts_id, caldavSummary[j].calendars[i].calendars_id)} style={{ borderColor:caldavSummary[j].calendars[i].calendarColor, borderLeftWidth: 10, marginBottom:10 }}>{caldavSummary[j].calendars[i].displayName}</ListGroup.Item>)
                calendars.push(cal)                    

            }
            finalOutput.push(<div key={caldavSummary[j].caldav_accounts_id}>{accountInfo}<ListGroup style={{marginBottom: 10}}>{calendars}</ListGroup> </div>)
            setFinalOutput(finalOutput)
        }

    }
    return(
    <>
    {finalOutput}
    </>
    )
}