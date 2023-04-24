import { varNotEmpty } from "../general";

export function TaskPending(todo)
{
    if(varNotEmpty(todo))
    {
        if((todo.completed==null || (todo.completed!=null && todo.completed.toString=="")) && (todo.status!="COMPLETED" && todo.completion!="100"))
        {
            return true
        }
        else{
            return false
        }
    }else{
        return true
    }
}