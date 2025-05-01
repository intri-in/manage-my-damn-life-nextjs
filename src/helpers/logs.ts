export function shouldLogforAPI() :boolean{
    if(process.env.NEXT_API_DEBUG_MODE && process.env.NEXT_API_DEBUG_MODE.toLowerCase()=="true")
    {

        return true
    }
    return false
}