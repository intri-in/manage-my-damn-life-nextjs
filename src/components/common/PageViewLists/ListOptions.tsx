import { useTranslation } from "next-i18next"
import { FiSunrise } from "react-icons/fi"
import { MdToday } from "react-icons/md"



export const MyDayOption = ({borderBottomColor}) =>{
    const {t} = useTranslation()
    return(
        <div  style={{ margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}} className="row">
                <div className="col">
                    <FiSunrise className="textDefault"  /> <span className="textDefault">{t("MY_DAY")}</span>
                </div>
        </div>
    )
}

export const DueTodayOption = (borderBottomColor) =>{
    const {t} = useTranslation()

    return(
        <div  style={{margin: 20, padding: 5, justifyContent: 'center', alignItems:'center', borderBottom: `1px solid ${borderBottomColor}`}}  className="row">
            <div className="col">
                <MdToday className="textDefault" /> <span className="textDefault" >{t("DUE_TODAY")}</span>
            </div>
        </div>
    )
}