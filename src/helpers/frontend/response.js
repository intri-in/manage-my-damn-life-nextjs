

export function getMessageFromAPIResponse(body)
{
    if(body.data!=null && body.data.message!=null)
    {
        return body.data.message
    }
    else{
        return null
    }
}