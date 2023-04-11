import AppBarGeneric from "@/components/common/AppBarGeneric"
import { Loading } from "@/components/common/Loading"
import AddFilter from "@/components/filters/AddFilter"
import { Toastify } from "@/components/Generic"
import { getRandomString } from "@/helpers/crypto"
import { FilterHelper } from "@/helpers/frontend/classes/FilterHelper"
import { filtertoWords, getFiltersFromServer } from "@/helpers/frontend/filters"
import { getI18nObject } from "@/helpers/frontend/general"
import { getMessageFromAPIResponse } from "@/helpers/frontend/response"
import { dateTimeReviver } from "@/helpers/general"
import Head from "next/head"
import { withRouter } from "next/router"
import { Component } from "react"
import { Col, Row } from "react-bootstrap"
import  Button  from "react-bootstrap/Button"
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';


class ManageFilters extends Component{

    constructor(props)
    {
        super(props)
        this.i18next = getI18nObject()

        this.state={addFilterForm: null, filterList: <Loading />}
        this.AddFilterButtonClicked = this.AddFilterButtonClicked.bind(this)
        this.onAddNewFilter = this.onAddNewFilter.bind(this)
        this.generateFilterList = this.generateFilterList.bind(this)

    }

    componentDidMount()
    {
        this.setState({addFilterForm:  (<div style={{textAlign: "right"}}><Button onClick={this.AddFilterButtonClicked}>{this.i18next.t("ADD_NEW_FILTER")}</Button></div>)})
        this.generateFilterList()
    }
    async generateFilterList()
    {
        var filtersFromServer = await getFiltersFromServer()
        var finalOutput=[]
        if(filtersFromServer!=null && filtersFromServer.success!=null && filtersFromServer.success==true )
        {
            
            if(Array.isArray(filtersFromServer.data.message))
            {
                for (let i=0; i< filtersFromServer.data.message.length; i++)
                {
                    var jsonFilter= JSON.parse(filtersFromServer.data.message[i].filtervalue)
                    finalOutput.push(
                        <div key={i+"_"+getRandomString(6)} style={{background: "#F1F1F1", padding: 20, marginBottom:20, borderRadius: 20}}>
                            <Row>
                                <Col>
                                <h3 >{filtersFromServer.data.message[i].name}</h3>
                                <p key={getRandomString(9)} id={getRandomString(6)}className="textDefault"> {filtertoWords(jsonFilter)}</p>

                                </Col>
                                <Col style={{textAlign: "right"}}>
                                <AiOutlineEdit  key={i+"_words_"+getRandomString(6)} onClick={()=> this.editFilterButtonClicked(filtersFromServer.data.message[i])} color="red" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<AiOutlineDelete onClick={()=> this.deleteButtonClicked(filtersFromServer.data.message[i].custom_filters_id)} color="red" />
                                </Col>
                            </Row>
                        </div>
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

        var filterList = finalOutput

        if(filterList.length>0)
        {
            this.setState({filterList: filterList})

        }else{
            this.setState({filterList: this.i18next.t("NO_FILTERS_TO_SHOW")})

        }
    }

    AddFilterButtonClicked()
    {
        this.setState({addFilterForm: (<AddFilter onAdd={this.onAddNewFilter} />)})
    }
    editFilterButtonClicked(filter)
    {

        this.setState({addFilterForm: (<AddFilter filterName={filter.name} filter={JSON.parse(filter.filtervalue,  dateTimeReviver)} filterid={filter.custom_filters_id} mode="edit" onAdd={this.onAddNewFilter} />)})

    }
    onAddNewFilter(response){
        this.generateFilterList()
        if(response)
        {
            toast.success(this.i18next.t("FILTER_INSERT_OK"))

        }
        this.setState({addFilterForm: (<div style={{textAlign: "right"}}><Button onClick={this.AddFilterButtonClicked}>Add New Filter</Button></div>)})

    }
    async deleteButtonClicked(filterid)
    {
        var deleteResponse = await FilterHelper.deleteFromServer(filterid)
        console.log(deleteResponse)
        if(deleteResponse!=null && deleteResponse.success!=null && deleteResponse.success==true)
        {
            if(deleteResponse.data.message!=null)
            {
                toast.success(this.i18next.t(deleteResponse.data.message))
            }else
            {
                toast.success(this.i18next.t("DELETE_OK"))
            }
            this.generateFilterList()
        }
        else
        {
            if(deleteResponse.data.message!=null)
            {
                toast.error(deleteResponse.data.message)
            }else{
                toast.success("ERROR")
            }
        }
    }
    render(){

        
        return(
        <>
            <Head>
            <title>{"MMDM - "+this.i18next.t("MANAGE_FILTERS")}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            </Head>
            <AppBarGeneric />
            <div style={{marginTop: 30, padding:40}} className='container-fluid'>
            <h1>{this.i18next.t("MANAGE_FILTERS")}</h1>
            <p>{this.i18next.t("MANAGE_FILTERS_DESC")}</p>
            <br/>
            <h2>{this.i18next.t("YOUR_FILTERS")}</h2>
            <div style={{padding: 20, marginBottom: 20, }}>
                {this.state.filterList}

            </div>
            {this.state.addFilterForm}
            </div>
            <Toastify />
        </>)
    }
}

export default withRouter(ManageFilters)

