import { varNotEmpty } from "@/helpers/general";
import { returnGetParsedVTODO } from "../calendar";
import * as _ from 'lodash'
export class VTODO {

    constructor(objectFromServer, isJustUnparsed) {
        if (varNotEmpty(isJustUnparsed) && isJustUnparsed == false || !varNotEmpty(isJustUnparsed)) {
            let todo = returnGetParsedVTODO(objectFromServer.data)
            todo["url_internal"] = objectFromServer.url
            todo["etag"] = objectFromServer.etag
            todo["calendar_id"] = objectFromServer.calendar_id
            todo["deleted"] = objectFromServer.deleted
            todo["calendar_events_id"] = objectFromServer["calendar_events_id"]

            this.parsedData = todo
            this.unparsedData = objectFromServer.data


        } else {
            let todo = returnGetParsedVTODO(objectFromServer)
            this.parsedData = todo
            this.unparsedData = objectFromServer

        }
    }

    hasParent(){
        let relatedTo = this.parsedData.relatedto
        // console.log("relatedTo", relatedTo)
        if(typeof (relatedTo) == "string"){
            // The object has basic related to relationship, which we will ascertain as having a parent.
            if(relatedTo){
                return true
            }        
            return false
        }

        //Related to is an object

        if (Array.isArray(relatedTo)) {
            for (const k in relatedTo) {
                if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                    if (relatedTo[k].params.RELTYPE == "PARENT") {
                        return true
                    }
                }


            }
        } else {
            if (varNotEmpty(relatedTo.params) && varNotEmpty(relatedTo.params.RELTYPE)) {
                if (relatedTo.params.RELTYPE == "PARENT") {
                    return true
                }
            }
        }


        return false

           
    }
    hasNoRelatedParent() {

        let relatedTo = this.parsedData.relatedto
        if (varNotEmpty(relatedTo) && relatedTo != "") {

            if (typeof (relatedTo) != "string") {
                if (Array.isArray(relatedTo)) {
                    for (const k in relatedTo) {
                        if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                            if (relatedTo[k].params.RELTYPE == "PARENT") {
                                return false
                            }
                        }


                    }
                } else {
                    if (varNotEmpty(relatedTo.params) && varNotEmpty(relatedTo.params.RELTYPE)) {
                        if (relatedTo.params.RELTYPE == "PARENT") {
                            return false
                        }
                    }
                }


                return true

            } else {
                return false
            }

        } else {
            return true
        }


    }

    getParent() {
        var relatedTo = this.parsedData.relatedto

        if (varNotEmpty(relatedTo) && relatedTo != "") {

            if (typeof (relatedTo) != "string") {
                if (Array.isArray(relatedTo)) {
                    for (const k in relatedTo) {
                        if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                            if (relatedTo[k].params.RELTYPE == "PARENT") {
                                return relatedTo[k].val
                            }
                        }


                    }
                } else {
                    if (varNotEmpty(relatedTo.params) && varNotEmpty(relatedTo.params.RELTYPE)) {
                        if (relatedTo.params.RELTYPE == "PARENT") {
                            return relatedTo.val
                        }
                    }
                }



            } else {
                return relatedTo
            }
        } else {
            return ""
        }


    }

    static getParentIDFromRelatedTo(relatedTo) {

        if (varNotEmpty(relatedTo) && relatedTo != "") {

            if (typeof (relatedTo) != "string") {
                if (Array.isArray(relatedTo)) {
                    for (const k in relatedTo) {
                        if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                            if (relatedTo[k].params.RELTYPE == "PARENT") {
                                return relatedTo[k].val
                            }
                        }


                    }
                } else {
                    if (varNotEmpty(relatedTo.params) && varNotEmpty(relatedTo.params.RELTYPE)) {
                        if (relatedTo.params.RELTYPE == "PARENT") {
                            return relatedTo.val
                        }
                    }
                }



            } else {
                return relatedTo
            }
        } else {
            return ""
        }


    }

    static addParentToRelatedTo(parentID, oldRelatedTo) {
        if (varNotEmpty(oldRelatedTo) && oldRelatedTo != "") {

            if (typeof (oldRelatedTo) != "string") {
                if (Array.isArray(oldRelatedTo)) {
                    var parentKey= this.relatedToArrayHasParent(oldRelatedTo)

                    if(varNotEmpty(parentKey) && parentKey!=-1)
                    {
                        oldRelatedTo[parentKey].val=parentID
                    }else{
                        //Push new parent
                        oldRelatedTo.push({params:{RELTYPE: "PARENT"}, val:parentID})
                    }


                } else {
                    if (oldRelatedTo.params.RELTYPE == "PARENT") {
                        //Already has a parent. Replace.
                        oldRelatedTo.val = parentID
                    }else{
                        var toReturn = []
                        toReturn.push(oldRelatedTo)
                        toReturn.push({params:{RELTYPE: "PARENT"}, val:parentID})
                        return toReturn

                    }
                }
                return oldRelatedTo

            }
        } else {
            return parentID
        }
    }

    static relatedToArrayHasParent(relatedTo) {
        var toReturn = -1

        for (const k in relatedTo) {
            if (varNotEmpty(relatedTo[k].params) && varNotEmpty(relatedTo[k].params.RELTYPE)) {
                if (relatedTo[k].params.RELTYPE == "PARENT") {
                    return k
                }
            }


        }
        return toReturn

    }

    static removeParentFromRelatedTo(oldRelatedTo)
    {
        if (varNotEmpty(oldRelatedTo) && oldRelatedTo != "") {
            if (typeof (oldRelatedTo) != "string") {
                if (Array.isArray(oldRelatedTo)) {
                    var parentKey= this.relatedToArrayHasParent(oldRelatedTo)

                    if(varNotEmpty(parentKey) && parentKey!=-1)
                    {
                        var toReturn = []
                        for(const i in oldRelatedTo)
                        {
                            if(i!=parentKey)
                            {
                                toReturn.push(oldRelatedTo[i])
                            }


                        }
                        return toReturn
                    }else{
                        //Do nothing.
                       
                    }

                }else{
                    if (oldRelatedTo.params.RELTYPE == "PARENT") {
                        //Already has a parent. Replace.
                        return ""
                    }
                }
            }else{
                return ""
            }
        }
    }

}