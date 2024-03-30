import { getI18nObject } from "@/helpers/frontend/general"
import { useAtomValue, useSetAtom } from "jotai"
import { useState } from "react"
import { Button, ButtonGroup } from "react-bootstrap"
import { currentViewAtom } from "stateStore/ViewStore"

const i18next = getI18nObject()
export const ViewSelector = () => {

    /**
   * Jotai
   */
    const currentView = useAtomValue(currentViewAtom)
    const setCurrentView = useSetAtom(currentViewAtom)
  /**
   * Local State
   */


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
         <Button onClick={()=>buttonClicked("tasklist")} variant={buttonVariantTask}>{i18next.t("TASK_VIEW")}</Button>
         <Button variant={buttonVariantGantt} onClick={()=>buttonClicked("ganttview")}>{i18next.t("GANTT_VIEW")}</Button>
     </ButtonGroup>
    </div> )

}