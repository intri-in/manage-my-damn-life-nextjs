import { getI18nObject } from "@/helpers/frontend/general"
import { AiFillStar } from "react-icons/ai"
import { FiSunrise } from "react-icons/fi"
import { MdToday } from "react-icons/md"


const i18next = getI18nObject()

export const MyDayOption = ({borderBottomColor}) =>{
    return(
        <div  style={{ margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}} className="row">
                <div className="col">
                    <FiSunrise className="textDefault"  /> <span className="textDefault">{i18next.t("MY_DAY")}</span>
                </div>
        </div>
    )
}

export const DueTodayOption = (borderBottomColor) =>{
    return(
        <div  style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
            <div className="col">
                <MdToday className="textDefault" /> <span className="textDefault" >{i18next.t("DUE_TODAY")}</span>
            </div>
        </div>
    )
}