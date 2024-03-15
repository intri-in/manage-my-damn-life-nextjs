import { getFiltersFromServer } from '@/helpers/frontend/filters'
import { getI18nObject } from '@/helpers/frontend/general'
import { getMessageFromAPIResponse } from '@/helpers/frontend/response'
import { isDarkModeEnabled } from '@/helpers/frontend/theme'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { FcEmptyFilter } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { calDavObjectAtom, currentPageTitleAtom, filterAtom } from 'stateStore/ViewStore'

const i18next = getI18nObject()

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


    const generateList = useCallback(async() =>{

        const filterClicked = (jsonFilter, filterName) =>{
            setCurrentPageTitle(filterName)
            setFilterAtom(jsonFilter)
            setCalDavAtom({caldav_accounts_id: null, calendars_id: null})
            postClick()
        }
        let filtersFromServer = await getFiltersFromServer()
        var finalOutput : JSX.Element[]= []
        const borderColor = isDarkModeEnabled() ? "white": "black"
        if (filtersFromServer != null && filtersFromServer.success != null && filtersFromServer.success == true) {
            if (Array.isArray(filtersFromServer.data.message)) {
                for (let i = 0; i < filtersFromServer.data.message.length; i++) {
                    let jsonFilter = JSON.parse(filtersFromServer.data.message[i].filtervalue)
                    finalOutput.push(
                        <div onClick={()=>filterClicked(jsonFilter, filtersFromServer.data.message[i].name)} className="textDefault" style={{ borderBottom: `1px solid ${borderColor}`, padding: 4 }} key={i + "_words_" + filtersFromServer.data.message[i].name}> <FcEmptyFilter /> {filtersFromServer.data.message[i].name}</div>

                    )
                }
            }
        }else{
            if(filtersFromServer==null)
            {
                toast.error(i18next.t("ERROR_GENERIC"))
            }else{
                var message= getMessageFromAPIResponse(filtersFromServer)
                console.error("generateList", message, filtersFromServer)

                if(message!=null)
                {
                    if(message!="PLEASE_LOGIN")
                    {
                    //     toast.error(this.i18next.t(message))

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
                    //     toast.error(this.i18next.t(message))

                    // }
                }
                else
                {
                    toast.error(i18next.t("ERROR_GENERIC"))

                }

            }

        }

        setFinalOutput(finalOutput)
    },[setCurrentPageTitle,setFilterAtom,setCalDavAtom,postClick, setFinalOutput])
    useEffect(() => {
        let isMounted = true
        if(isMounted)
        {
            generateList()
        }
        return ()=>{
            isMounted = false
        }
    }, [generateList])

    return(
        <>
        {finalOutput}
        </>
    )
}