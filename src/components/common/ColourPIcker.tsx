import { useState } from "react"
import { Button } from "react-bootstrap"
import { SketchPicker } from 'react-color'

interface propsType{
    colour:string | undefined,
    onChange: Function
    keyName?: string
}
export default function ColourPicker(props:propsType){
    const [colour, setChangeColour] = useState(props.colour)
    const [displayColourPicker, setDisplayColourPicker] = useState(false)
    
    const handleClick = () =>{
        setDisplayColourPicker(true)
    }

    const handleColourClose = () =>{
        setDisplayColourPicker(prev => !prev)
        props.onChange(colour, props.keyName)
    }
    const handleChangeofColour = (selectedColor) =>{
        setChangeColour(selectedColor.hex)
    }

    return(
        <>
        <div style={{   padding: '5px',
            background: '#fff',
            borderRadius: '1px',
            maxWidth:"50px",
            alignItems:"center",
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            display: 'inline-block',
            cursor: 'pointer',
            }} onClick={() =>handleClick()}>
                <div style={{background: colour, width: '36px', height: '14px', borderRadius: '2px',}}>

                </div>
        </div>
        {
        displayColourPicker ?
        (<div style={{          
            position: 'absolute',
        zIndex: '2',}}>                            

            <div onClick={()=>handleColourClose()}  style={{  position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',}}>

            <Button> Hi</Button>
            </div>
            <SketchPicker color={colour} onChange={handleChangeofColour} />
        </div>
        ):null
        }
    </>
    )
}