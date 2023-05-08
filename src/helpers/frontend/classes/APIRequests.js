import { getAPIURL } from "@/helpers/general"
import { getAllEvents } from "../calendar"
import { getEvents } from "../events"
import { toast } from "react-toastify"
import { getMessageFromAPIResponse } from "../response"
import { getI18nObject } from "../general"

export class APIRequests{

    constructor(props)
    {
        this.props = props
        this.i18next = getI18nObject()
    }
    async getAllTodosFromServer()
    {
        var responseFromServer = await getAllEvents("todo")
        var combinedTodoList = [{}, {}, {}, {}]
        if (responseFromServer != null && responseFromServer.success == true && responseFromServer.data.message != null) {
            for (const i in responseFromServer.data.message) {
                var todoArray = responseFromServer.data.message[i].events
                const todoListSorted = await getEvents(todoArray, this.props.filter)
                //console.log(todoListSorted)
                for(const k in todoListSorted[0])
                {
                    //console.log(k)
                    combinedTodoList[0][k]=_.cloneDeep(todoListSorted[0][k])
                }
                for(const k in todoListSorted[1])
                {
                    combinedTodoList[1][k]=_.cloneDeep(todoListSorted[1][k])
                }
                for(const k in todoListSorted[2])
                {
                    combinedTodoList[2][k]=_.cloneDeep(todoListSorted[2][k])
                    combinedTodoList[3][k]=_.cloneDeep(responseFromServer.data.message[i].info.color)

                }
            }
            return combinedTodoList
        }
        else{
            if(responseFromServer==null)
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))
            }else{
                var message= getMessageFromAPIResponse(responseFromServer)
                if(message!=null)
                {
                    if(message=="PLEASE_LOGIN")
                    {
                        // Login required
                        var redirectURL="/login"
                        if(window!=undefined)
                        {


                            redirectURL +="?redirect="+window.location.pathname
                        }
                        this.props.router.push(redirectURL)


                    }else{
                        toast.error(this.i18next.t(message))

                    }
                }
                else
                {
                    toast.error(this.i18next.t("ERROR_GENERIC"))

                }

            }

        }
    }
}