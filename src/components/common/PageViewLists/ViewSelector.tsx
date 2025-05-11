import { useAtomValue, useSetAtom } from "jotai"
import { useState } from "react"
import { Button, ButtonGroup } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import { currentViewAtom } from "stateStore/ViewStore"

export const ViewSelector = () => {

    /**
   * Jotai
   */
    const currentView = useAtomValue(currentViewAtom)
    const setCurrentView = useSetAtom(currentViewAtom)
  /**
   * Local State
   */

  const {t} = useTranslation()
  var buttonVariantTask="secondary"
  var buttonVariantGantt="outline-secondary"

  const buttonClicked = (view: string) =>{
    setCurrentView(view)
  }
  if(currentView=="ganttview")
  {
      buttonVariantTask="outline-secondary"
      buttonVariantGantt="secondary"
  }

  return(    
    <div style={{textAlign: "center", marginTop: 20}}>
     <ButtonGroup>
         <Button onClick={()=>buttonClicked("tasklist")} variant={buttonVariantTask}>{t("TASK_VIEW")}</Button>
         <Button variant={buttonVariantGantt} onClick={()=>buttonClicked("ganttview")}>{t("GANTT_VIEW")}</Button>
     </ButtonGroup>
    </div> )

}