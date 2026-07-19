

export function getMessageFromAPIResponse(body: any)
{
    if(!body) return null
    if(body.data && body.data.message){
        return body.data.message
    }
        return null
}

