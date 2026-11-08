import {RRule, rrulestr} from 'rrule'

export function parseRRuleString(input: any): RRule | null{
    if(!input) return null
    try{
        // console.log("parseinput", typeof(input), input)
        let rrule: RRule | null = null
        if(typeof(input)==="string"){
            return rrulestr(input)
        }else if (typeof(input==="object")){
            // First assuming that it is a valid parsed object from our internal parser.
            if("val" in input && typeof(input.val)==="string") return rrulestr(input.val)
            
            // We now try to convert it into string and parse it back. If that works, it might be a valid rrule.
            let rruleTemp = input.toString()
            return rrulestr(rruleTemp)
        } 

        rrule = rrulestr(input)
        return rrule
    }catch(e){
        console.warn(`parseRRuleString: ${input}`,e)
        return null
    }
}