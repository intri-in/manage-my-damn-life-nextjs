import FilterList from "@/components/filters/FilterList"
import { SYSTEM_DEFAULT_LABEL_PREFIX } from "@/config/constants"
import { PRIMARY_COLOUR } from "@/config/style"
import { getAllLabelsFromDexie, updateLabelCacheInDexie } from "@/helpers/frontend/dexie/dexie_labels"
import { getI18nObject } from "@/helpers/frontend/general"
import { isDarkModeEnabled } from "@/helpers/frontend/theme"
import { PAGE_VIEW_JSON, PAGE_VIEW_NAME_ALL_TASKS, PAGE_VIEW_NAME_DUE_NEXT_SEVEN, PAGE_VIEW_NAME_DUE_TODAY, PAGE_VIEW_NAME_HIGH_PRIORITY, PAGE_VIEW_NAME_MY_DAY } from "@/helpers/viewHelpers/pages"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge, Col, Row } from "react-bootstrap"
import { AiFillStar, AiOutlineFilter, AiOutlineSetting } from "react-icons/ai"
import { FiSunrise } from "react-icons/fi"
import { IoRefreshCircleOutline } from "react-icons/io5"
import { MdToday } from "react-icons/md"
import { toast } from "react-toastify"
import { useAtomValue, useSetAtom } from 'jotai'
import { calDavObjectAtom, currentPageAtom, currentPageTitleAtom, filterAtom } from "stateStore/ViewStore"
import { FilterListWithStateManagement } from "@/components/filters/FilterListWithStateManagement"
import { BsCalendar3 } from "react-icons/bs"
import ShowCalendarList from "../calendars/ShowCalendarList"
import { ShowCalendarListWithStateManagement } from "../calendars/ShowCalendarListWithStateManagement"
const i18next = getI18nObject()
export const GenericListsWithStateManagement = ({postClick}: {postClick: Function}) =>{
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)
    /**
     * Local State
     */
    const [totalHeight, setTotalHeight] = useState(0)
    const [allFilters, setAllFilters] = useState<JSX.Element[]>([])


    const updateDimensions = () => {
        setTotalHeight(window.innerHeight-100);
    };
    const pageViewClicked = (pageName) =>{
        setCurrentPageTitle(i18next.t(pageName).toString())
        setFilterAtom(PAGE_VIEW_JSON[pageName])
        setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
        postClick()
    }

    const labelClicked = (e) =>{
        const labelName = e.target.textContent
        const currentFilter = {label: [labelName]}
        const title = "Label: " + labelName
        setCurrentPageTitle(title)
        setFilterAtom({logic: "or", filter: currentFilter})
        setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
        postClick()
    }
    const generateLabelListfromDexie = async () =>{
        const labels = await getAllLabelsFromDexie()
        let temp_Labelcomponent: JSX.Element[] =[]
        if(labels!=null)
        {
            for (const key in labels)
            {      
                //temp_Labelcomponent.push((<><Button size="sm" value={labels[key].name} onClick={this.props.labelClicked} style={{margin: 5, backgroundColor: labels[key].colour, color: 'white'}} >{labels[key].name}</Button>{' '}</>))
                var border="1px solid "+labels[key].colour
                if(!labels[key]?.name?.startsWith(SYSTEM_DEFAULT_LABEL_PREFIX+"-"))
                {
                    temp_Labelcomponent.push(<Badge  key={labels[key].name} onClick={labelClicked} bg="light" pill style={{margin: 5, borderColor:"pink", border:border, color: labels[key].colour,  textDecorationColor : 'white'}} >{labels[key].name}</Badge>)

                }
            }

            if(temp_Labelcomponent.length==0){
                setAllFilters([<>{i18next.t("NO_LABELS_TO_SHOW")}</>])
            }else{

                setAllFilters(temp_Labelcomponent)
            }

        }
    }

    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            generateLabelListfromDexie()
        }
        if(window!=undefined)
        {
            setTotalHeight(window.innerHeight-100);

            window.addEventListener('resize', updateDimensions);

        }

        return ()=>{
            isMounted = false
        }
    }, [])

    
    const updateLabelCache = () =>{
        toast.info(i18next.t("UPDATING_LABEL_CACHE"))
        updateLabelCacheInDexie().then(()=>{
            generateLabelListfromDexie()
        })
    }

    const darkMode= isDarkModeEnabled() 
    const borderBottomColor = darkMode ? "white" : "black"
    const settingButtonColor = darkMode ? "white" : PRIMARY_COLOUR

    return(
        <>
            <div style={{overflowY: 'scroll',  height: totalHeight}}>
                <div  onClick={() =>pageViewClicked(PAGE_VIEW_NAME_MY_DAY)}  style={{ margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}} className="row">
                    <div className="col">
                        <FiSunrise className="textDefault"  /> <span className="textDefault">{i18next.t("MY_DAY")}</span>
                    </div>
                </div>
                <div  onClick={() =>pageViewClicked(PAGE_VIEW_NAME_DUE_TODAY)}  style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                    <div className="col">
                        <MdToday className="textDefault" /> <span className="textDefault" >{i18next.t("DUE_TODAY")}</span>
                    </div>
                </div>
                <div onClick={() =>pageViewClicked(PAGE_VIEW_NAME_DUE_NEXT_SEVEN)} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                <div className="col">
                    <MdToday className="textDefault"/> <span className="textDefault">{i18next.t("DUE_NEXT_SEVEN_DAYS")}</span>
                </div>
                </div>
                <div onClick={() =>pageViewClicked(PAGE_VIEW_NAME_HIGH_PRIORITY)} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                    <div  className="col">
                        <AiFillStar className="textDefault"/> <span className="textDefault"> {i18next.t("HIGH_PRIORITY")}
</span>
                    </div>
                </div>
                <div  onClick={() =>pageViewClicked(PAGE_VIEW_NAME_ALL_TASKS)} style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div  className="col">
                            <MdToday className="textDefault"/> <span className="textDefault">  All tasks
</span>
                        </div>
                    </div>

                <br />
                
                <div style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                    <Col><h3><AiOutlineFilter />{i18next.t("FILTERS")}</h3></Col>
                    <Col style={{textAlign:"right"}}><Link href="/filters/manage"> <AiOutlineSetting color={settingButtonColor} /></Link></Col>
                </div>
                <Row style={{borderBottom: `1px solid ${borderBottomColor}`, margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} >
                    <Col><FilterListWithStateManagement postClick={postClick}  /></Col>
                </Row>
                <Row style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', display: "flex" }} >
                    <Col><h3>By Labels</h3></Col>
                    <Col> <h3 style={{textAlign: "right"}}><IoRefreshCircleOutline onClick={updateLabelCache} color={settingButtonColor} />&nbsp;&nbsp;<Link href="/labels/manage"><AiOutlineSetting  color={settingButtonColor}/></Link></h3></Col>
                </Row>
                <div style={{marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
                        <div className="col-12">
                            {allFilters}
                        </div>
                </div>
                <div style={{marginTop: 40, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }} className="row">
                        <Col>
                        <h3><BsCalendar3 /> Calendars</h3>
                        </Col>
                        <Col style={{textAlign:"right"}}><Link href="/accounts/caldav"><AiOutlineSetting color={settingButtonColor} /></Link> </Col>

                    </div>
                    <Row style={{ marginTop: 10, marginLeft: 20, marginRight: 20, padding: 5, justifyContent: 'center', alignItems:'center', }}>
                        <ShowCalendarListWithStateManagement postClick={postClick}  />
                    </Row>

            </div>

        </>
    )
}