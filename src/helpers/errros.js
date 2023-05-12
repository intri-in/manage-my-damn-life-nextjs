import { varNotEmpty } from "./general";

export function getErrorResponse(e)
{
    if(varNotEmpty(e) && varNotEmpty(e.message))
    {
        return({
            success:false,
            data:{
                message:e.message,
                details:JSON.stringify(e)
            }
        })
    
    }else{
        return({
            success:false,
            data:{
                message:"ERROR_GENERIC",
            }
        })
    
    }
} 