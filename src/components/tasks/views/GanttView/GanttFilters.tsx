import { getI18nObject } from "@/helpers/frontend/general"
import { ViewMode } from "gantt-task-react"
import { useState } from "react"
import { Col, Form, Row } from "react-bootstrap"

const i18next = getI18nObject()
export const GanttFilters = ({onViewChanged, onShowChildrenChanged, onShowTaskWithoutDueChanged}:{onViewChanged: Function, onShowChildrenChanged: Function, onShowTaskWithoutDueChanged: Function}) =>{

    const [showChildren, setShowChildren] = useState(true)
    const [showWithoutDue, setShowWithoutDue] = useState(false)
    const [view, setView] = useState(ViewMode.Week)
    const viewChanged = (e) =>{
        setView(e.target.value)
        onViewChanged(e.target.value)
    }
    const childrenVisiblityChanged = (e) =>{
        setShowChildren(e.target.checked)
        onShowChildrenChanged(e.target.checked)
    }
    const showTaskWithoutDueChanged = (e) =>{
        setShowWithoutDue(e.target.checked)
        onShowTaskWithoutDueChanged(e.target.checked)
    }
    return(
        <Row>
            <Col>
                <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                    {i18next.t("VIEW")}&nbsp;&nbsp;
                    <Form.Select value={view} onChange={viewChanged} style={{ width: 200 }} size="sm">
                        <option value={ViewMode.Day}>{i18next.t("DAY_VIEW")}</option>
                        <option value={ViewMode.Week}>{i18next.t("WEEK_VIEW")}</option>
                        <option value={ViewMode.Month}>{i18next.t("MONTH_VIEW")}</option>
                    </Form.Select>

                </span>

            </Col>
            <Col>
                <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                    &nbsp;&nbsp;
                    <Form.Check
                        type="switch"
                        key="switch_OK"
                        id="children_visible_switch"
                        checked={showChildren}
                        onChange={childrenVisiblityChanged}
                        label={i18next.t("SHOW_CHILDREN")}
                    />
                </span>


            </Col>
            <Col>
                <span style={{ justifyContent: 'center', display: 'flex', alignItems: "center", paddingBottom: 30, paddingTop: 30 }}>

                    &nbsp;&nbsp;
                    <Form.Check
                        type="switch"
                        checked={showWithoutDue}
                        onChange={showTaskWithoutDueChanged}
                        label={i18next.t("SHOW_TASKS_WITH_NO_DUE")}
                    />
                </span>


            </Col>
        </Row>
    )
}