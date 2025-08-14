import { useEffect, useState } from "react"
import { Loading } from "./Loading"
import { Container } from "react-bootstrap"
import Image from "next/image"
export const EmptyPageBeforeLogin = () =>{
    
    return (
        <Container fluid>
        <div style={{ margin: "0", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <div style={{ textAlign: 'center' }}>
                <Image alt='Logo' src="/logo.png" width={100} height={100} />
            </div>
            <br />           
            <Loading centered={true} />
            <br />
            
        </div>
        {/*  <Toastify /> */}
    </Container>

    )
}