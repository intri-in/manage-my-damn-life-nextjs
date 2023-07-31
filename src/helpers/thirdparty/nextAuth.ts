
export function nextAuthEnabled(){
    if(process.env.NEXT_PUBLIC_USE_NEXT_AUTH==="true"){
        return true
    }else{
        return false
    }
}

/**
 * Takes in result of getServerSession from NextAuth.js
 * and return the user id.
 */
export function getUserIDFromNextAuthSession(session: any)
{
    if(session){
        if(session.user)
        {
            if(session.user.id){
                return session.user.id
            }
        }
    }

    return null
}