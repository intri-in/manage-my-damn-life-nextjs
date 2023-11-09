import { useSession } from "next-auth/react";
import AppBarGeneric_ClassComponent from "./AppBarGenericClass";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface propsType{
    isSyncing?: boolean,
    onSynComplete?: Function
}
const AppBarGeneric= ({isSyncing, onSynComplete}:propsType) =>{

    // const [lastSync, setLastSync] = useState(0)
    // useEffect(()=>{
    // const interval= setInterval(() => {

    //         //context.syncButtonClicked()
    //         //toast.info("syncing")
    //         setLastSync(prev => prev+1)
            
    //     }, 1*1000)
        
    //     return () =>{
    //         clearInterval(interval)
    //     }
    // },[])

    const session = useSession()
    const router = useRouter()
    return (
    <>
        <AppBarGeneric_ClassComponent router={router} session={session} isSyncing={isSyncing} onSynComplete={onSynComplete} />
    </>)
}

export default AppBarGeneric