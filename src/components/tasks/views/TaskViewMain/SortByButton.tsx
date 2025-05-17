import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';

export const SortBySelect = ({onChangeHandler}:{onChangeHandler: Function}) =>{

    const [value, setValue] = useState("due_asc")
    const { t } = useTranslation()
    const optionSelected = (e) =>{
        setValue(e.target.value)
        onChangeHandler(e.target.value)
    }
    return (
        <>
        <Form.Select onChange={optionSelected} value={value} style={{maxHeight: "50px"}} size="sm">
        <option value="due_asc">{t("SORT_BY")} {t("DUE")} ({t("ASC")})</option>
        <option value="due_desc">{t("SORT_BY")} {t("DUE")} ({t("DESC")})</option>
        <option value="priority_desc">{t("SORT_BY")} {t("PRIORITY")} ({t("DESC")})</option>
        </Form.Select>
        </>
      );
}