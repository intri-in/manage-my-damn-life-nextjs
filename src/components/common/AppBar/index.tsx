'use client'
import { useSession } from "next-auth/react";
import AppBarFunctionalComponent from "./AppBarFunctionalComponents";
import { useTranslation } from "next-i18next";

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
    const {t} = useTranslation()
    return (
    <>
        <AppBarFunctionalComponent t={t} session={session} />
    </>)
}

export default AppBarGeneric