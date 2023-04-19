

export function getMessageFromAPIResponse(body)
{
    if(body==null)
    {
        return null
    }
    if(body.data!=null && body.data.message!=null)
    {
        return body.data.message
    }
    else{
        return null
    }
}