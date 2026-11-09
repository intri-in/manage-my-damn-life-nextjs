import { ParsedOptions } from "node_modules/rrule/dist/esm/types";

export interface RruleObject{

    FREQ?:     string;
    UNTIL?:    string;
    INTERVAL?: string;
    COUNT?:    string;

}

export type { ParsedOptions as RRuleTypefromExternalLibrary };