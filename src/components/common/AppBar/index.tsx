import { useSession } from "next-auth/react";
import AppBarGeneric_ClassComponent from "./AppBarGenericClass";
import { useRouter } from "next/router";

interface propsType{
    isSyncing?: boolean,
    onSynComplete?: Function
}
const AppBarGeneric= ({isSyncing, onSynComplete}:propsType) =>{

    const session = useSession()
    const router = useRouter()
    return <AppBarGeneric_ClassComponent router={router} session={session} isSyncing={isSyncing} onSynComplete={onSynComplete} />
}

export default AppBarGeneric