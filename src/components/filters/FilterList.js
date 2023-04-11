import { getRandomString } from "@/helpers/crypto";
import { getFiltersFromServer } from "@/helpers/frontend/filters";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { withRouter } from "next/router";
import { Component } from "react";
import { FcEmptyFilter } from "react-icons/fc";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

class FilterList extends Component {
    constructor(props) {
        super(props)
        this.i18next = getI18nObject()
        this.state = { finalOutput: null }
        this.generateList = this.generateList.bind(this)
    }

    componentDidMount() {
        this.generateList()
    }
    async generateList() {
        var filtersFromServer = await getFiltersFromServer()
        var finalOutput = []
        if (filtersFromServer != null && filtersFromServer.success != null && filtersFromServer.success == true) {
            if (Array.isArray(filtersFromServer.data.message)) {
                for (let i = 0; i < filtersFromServer.data.message.length; i++) {
                    var jsonFilter = JSON.parse(filtersFromServer.data.message[i].filtervalue)
                    finalOutput.push(
                        <div onClick={()=>this.props.filterClicked(jsonFilter, filtersFromServer.data.message[i].name)} className="textDefault" style={{ borderBottom: "1px solid black", padding: 4 }} key={i + "_words_" + getRandomString(6)}> <FcEmptyFilter /> {filtersFromServer.data.message[i].name}</div>

                    )
                }
            }
        }else{
            if(filtersFromServer==null)
            {
                toast.error(this.i18next.t("ERROR_GENERIC"))
            }else{
                var message= getMessageFromAPIResponse(filtersFromServer)
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

        this.setState({ finalOutput: finalOutput })

    }
    render() {
        return (<>
            {this.state.finalOutput}
        </>)
    }
} 

export default withRouter(FilterList)