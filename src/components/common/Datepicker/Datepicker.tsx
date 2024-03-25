import { useAtomValue } from 'jotai';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { currentDateFormatAtom, currentSimpleDateFormatAtom, currentSimpleTimeFormatAtom } from 'stateStore/SettingsStore';
import { FaCalendarAlt } from "react-icons/fa";
import { BACKGROUND_GRAY } from '@/config/style';
export const Datepicker = ({ title, value, onChangeHook, showDateOnly, isRequired }: { title?: string,value: string, onChangeHook: Function, showDateOnly?: boolean, isRequired?:boolean}) => {

    /**
     * Jotai
     */

    const dateFormatFromAtom = useAtomValue(currentSimpleDateFormatAtom)
    const timeFormatFromAtom = useAtomValue(currentSimpleTimeFormatAtom)
    const fullDateFormatFromAtom = useAtomValue(currentDateFormatAtom)
    /**
     * Local State
     */
    const [fullDateFormat, setFullDateFormat] = useState(fullDateFormatFromAtom)
    const [timeFormat, setTimeFormat] = useState(timeFormatFromAtom)
    const [dateFormat, setDateFormat] = useState(dateFormatFromAtom)

    const [manualDateInput, setManualDateInput] = useState("")
    const [inputValid, setInputValid] = useState(true)
    const [datePicked, setDatePicked] = useState(moment())
    const [showDatePicker, setShowDatePicker] = useState(false)

  
    useEffect(()=>{
        let isMounted = true
        if (isMounted) {
            if(showDateOnly){
                setTimeFormat("")
                setFullDateFormat(dateFormat)
            }else{
                setTimeFormat(timeFormatFromAtom)
                setFullDateFormat(fullDateFormatFromAtom)
            }

        }
        return () => {
            isMounted = false
        }
    },[showDateOnly])
    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            if (value) {
                /**
                 * On change of props, we only set the date, if the user hasn't entered a date manually.
                 */
                // console.log(moment(value).isValid(), value, fullDateFormat)
                setInputValid(moment(value).isValid())
                setManualDateInput((manualDate) => {
                    return moment(value).format(fullDateFormat)
                    // if (!manualDate) {

                    // } else {
                    //     return manualDate

                    // }
                })

            }
        }
        return () => {
            isMounted = false
        }


    }, [value, timeFormat, fullDateFormat])
    // useEffect(() => {
    //     let isMounted = true


    //     if (isMounted) {
    //         setManualDateInput((date) => {
    //             if (date) {
    //                 return moment(date).format(fullDateFormat)
    //             } else {
    //                 if(value){

    //                     return moment(value).format(fullDateFormat)
    //                 }else{
    //                     return date
    //                 }
    //             }
    //         })

    //     }
    // },[showDateOnly])

    const onDatePicked = (value) => {
        if (value._d) {
            setDatePicked(value)
            setManualDateInput(moment(value).format(fullDateFormat))
            setInputValid(true)
            // setDate(moment(value).toISOString())
            onChangeHook(moment(value).toISOString(),true)
        }
    }

    const dateChanged = (e) => {
        setManualDateInput(e.target.value)
        // console.log(moment(e.target.value, fullDateFormat, true).isValid(), moment(e.target.value))
        const isValid = moment(e.target.value, fullDateFormat, true).isValid()
        if (isValid) {
            setDatePicked(moment(e.target.value, fullDateFormat, true))
            onChangeHook(moment(e.target.value, fullDateFormat, true).toISOString(), isValid)
            // setDate(moment(e.target.value, fullDateFormat, true).toISOString())           
            setInputValid(true)
        } else {
            if(e.target.value){
                // setDate("")           
                onChangeHook("", isValid)
            }else{
                // setDate("")           
                onChangeHook("",true)    
            }
            setInputValid(false)
        }

    }

    const backGround = showDatePicker ? "lightblue" : ""
    let isInvalid = false
    if(!inputValid){

        if(manualDateInput){
            isInvalid= true
        }else{
            if(isRequired){
                isInvalid= true
            }
        }
    }else{
        if(!manualDateInput){
            if(isRequired){
                isInvalid= true
            }
        }
    }

    return (
        <div >
           {/* {`value: ${value}`} */}
            <InputGroup className="mb-3">
                <Form.Control isInvalid={isInvalid} value={manualDateInput} onChange={dateChanged} />
                <InputGroup.Text style={{ background: backGround }} onClick={() => setShowDatePicker(prev => !prev)} id="showCalendarButton"><FaCalendarAlt /></InputGroup.Text>

            </InputGroup>
            {
                showDatePicker ?
                    (
                       
                        <Datetime dateFormat={dateFormat} timeFormat={timeFormat} value={datePicked} input={false} onChange={onDatePicked} />
                    )
                    : null
            }
        </div>
    )
}