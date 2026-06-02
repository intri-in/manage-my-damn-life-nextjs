export function shouldLogforAPI() :boolean{
    if(process.env.NEXT_API_DEBUG_MODE && process.env.NEXT_API_DEBUG_MODE.toLowerCase()=="true")
    {

        return true
    }
    return false
}

export function shouldLogforSequelize():boolean{
    if(process.env.SEQUELIZE_DEBUG_LOGGING && process.env.SEQUELIZE_DEBUG_LOGGING.toLowerCase()=="true")
    {

        return true
    }
    return false

}