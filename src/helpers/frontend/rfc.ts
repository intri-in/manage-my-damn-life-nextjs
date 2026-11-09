import { RFCDuration } from "src/types/rfc"

const RFCAllowedLastChars =["M", "H", "D", "W", "T"]
export const RFCValidActions = ["audio", "display", "email"]

export function parseRFCDuration(duration: string): RFCDuration | null{
    // console.log("parseRFCDuration duration", duration)
    if(!duration) return null
    if (typeof(duration)!=="string") return null
    if(duration){
        let durationString= duration
        // durationString =  duration.replaceAll("-", "")
        if(duration.startsWith("PT") || duration.startsWith("-PT")){
            durationString =  durationString.replaceAll("PT", "")

        }else if(duration.startsWith("-P") || duration.startsWith("P")){
            durationString =  durationString.replaceAll("P", "")
            
        }
        if(durationString){
            // console.log("durationString", durationString, parseDuration(durationString))
            return parseDuration(durationString)
        }
    }
    return null
}



function parseDuration(duration: string): RFCDuration | null{
    let toReturn: RFCDuration = {
        unit: "minutes",
        value : 0
    }
    const lastChar = duration.at(-1); 
    if(lastChar && RFCAllowedLastChars.includes(lastChar)){
        const possibleDuration = duration.replaceAll(lastChar, "");
        if(!isNaN(Number(possibleDuration))){
            toReturn.value = Number(possibleDuration)
            switch(lastChar){
                case "M":
                    toReturn.unit = "minutes"
                    return toReturn
                case "H":
                    toReturn.unit = "hours"
                    return toReturn
                case "D":
                    toReturn.unit = "days"
                    return toReturn
                case "W":
                    toReturn.unit = "weeks"
                    return toReturn
                default:
                    return null
            }
        }else{
            if(lastChar=="T"){
                return parseDuration(possibleDuration)
            }
        }

    }
    return null

}