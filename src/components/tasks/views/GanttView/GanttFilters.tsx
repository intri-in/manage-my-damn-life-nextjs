import { ViewMode } from "gantt-task-react"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import { Col, Form, Row } from "react-bootstrap"

export const GanttFilters = ({onViewChanged, onShowChildrenChanged, onShowTaskWithoutDueChanged}:{onViewChanged: Function, onShowChildrenChanged: Function, onShowTaskWithoutDueChanged: Function}) =>{

    const [showChildren, setShowChildren] = useState(true)
    const [showWithoutDue, setShowWithoutDue] = useState(false)
    const [view, setView] = useState(ViewMode.Week)
    const {t} = useTranslation()
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

                    {t("VIEW")}&nbsp;&nbsp;
                    <Form.Select value={view} onChange={viewChanged} style={{ width: 200 }} size="sm">
                        <option value={ViewMode.Day}>{t("DAY_VIEW")}</option>
                        <option value={ViewMode.Week}>{t("WEEK_VIEW")}</option>
                        <option value={ViewMode.Month}>{t("MONTH_VIEW")}</option>
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
                        label={t("SHOW_CHILDREN")}
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
                        label={t("SHOW_TASKS_WITH_NO_DUE")}
                    />
                </span>


            </Col>
        </Row>
    )
}