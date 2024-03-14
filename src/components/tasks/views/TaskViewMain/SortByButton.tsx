import { getI18nObject } from '@/helpers/frontend/general';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';

const i18next = getI18nObject()
export const SortBySelect = ({onChangeHandler}:{onChangeHandler: Function}) =>{

    const [value, setValue] = useState("due_asc")

    const optionSelected = (e) =>{
        setValue(e.target.value)
        onChangeHandler(e.target.value)
    }
    return (
        <>
        <Form.Select onChange={optionSelected} value={value} style={{maxHeight: "50px"}} size="sm">
        <option value="due_asc">Sort by Due (ASC)</option>
        <option value="due_desc">Sort by Due (DESC)</option>
        <option value="priority_desc">Sort by Priority (DESC)</option>
        </Form.Select>
        </>
      );
}