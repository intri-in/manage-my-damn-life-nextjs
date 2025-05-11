import { getFiltersFromServer } from '@/helpers/frontend/filters'
import { getMessageFromAPIResponse } from '@/helpers/frontend/response'
import { isDarkModeEnabled } from '@/helpers/frontend/theme'
import { useSetAtom } from 'jotai'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'next-i18next'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { FcEmptyFilter } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from 'stateStore/ViewStore'


export const FilterListWithStateManagement = ({postClick}: {postClick: Function}) =>{
    /**
     * Jotai
     */
    const setCurrentPageTitle= useSetAtom(currentPageTitleAtom)
    const setFilterAtom = useSetAtom(filterAtom)
    const setCalDavAtom = useSetAtom(calDavObjectAtom)
    /**
     * Local State
     */

    const [finalOutput, setFinalOutput] = useState<JSX.Element[]>([])
    const {t} = useTranslation()

    const generateList = async() =>{

        const filterClicked = (jsonFilter, filterName) =>{
            setCurrentPageTitle(filterName)
            setFilterAtom(jsonFilter)
            setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
            postClick()
        }
        let filtersFromServer = await getFiltersFromServer()
        let finalOutput : JSX.Element[]= []
        const borderColor = isDarkModeEnabled() ? "white": "black"
        if (filtersFromServer != null && filtersFromServer.success != null && filtersFromServer.success == true) {
            if (Array.isArray(filtersFromServer.data.message)) {
                for (let i = 0; i < filtersFromServer.data.message.length; i++) {
                    let jsonFilter = JSON.parse(filtersFromServer.data.message[i].filtervalue)
                    finalOutput.push(
                        <Row style={{ borderBottom: `1px solid ${borderColor}`, padding: 4 }} key={i + "_words_" + filtersFromServer.data.message[i].name}>
                        <Col xs={10}>
                            <div onClick={()=>filterClicked(jsonFilter, filtersFromServer.data.message[i].name)} className="textDefault" > <FcEmptyFilter /> {filtersFromServer.data.message[i].name}</div>
                        </Col>
                        <Col xs={2}> <Link target="_blank" href={`?type=FILTER&&q=${JSON.stringify(jsonFilter)}&&filter_name=${filtersFromServer.data.message[i].name}`}><FaExternalLinkAlt className="textDefault" /> </Link>
                        </Col>
                        </Row>


                    )
                }
            }
        }else{
            if(filtersFromServer==null)
            {
                toast.error(t("ERROR_GENERIC"))
            }else{
                const message= getMessageFromAPIResponse(filtersFromServer)
                console.error("generateList", message, filtersFromServer)

                if(message!=null)
                {
                    if(message!="PLEASE_LOGIN")
            
                    {
                    //     toast.error(this.t(message))

                    }

                    // if(message=="PLEASE_LOGIN")
                    // {
                    //     // Login required
                    //     var redirectURL="/login"
                    //     if(window!=undefined)
                    //     {


                    //         redirectURL +="?redirect="+window.location.pathname
                    //     }
                    //     this.props.router.push(redirectURL)


                    // }else{
                    //     toast.error(this.t(message))

                    // }
                }
                else
                {
                    toast.error(t("ERROR_GENERIC"))

                }

            }

        }

        if(finalOutput.length>0){

            setFinalOutput(finalOutput)
        }else{
            setFinalOutput([<div key="no_filters_toShow">{t("NO_FILTERS_TO_SHOW")}</div>])
        }
    }
    
    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            generateList()
        }
        return ()=>{
            isMounted = false
        }
    }, [])

    return(
        <>
        {finalOutput}
        </>
    )
}