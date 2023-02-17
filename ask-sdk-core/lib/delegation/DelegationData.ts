import { Intent, Slot } from "ask-sdk-model";

export interface DelegationData {
    delegateTarget: DelegateTarget;
    intentData? : Intent;
    acirData? : any;
}

export interface DelegateTarget {
    type: string;
    name: string;
    slots? : {[key : string] : Slot}
}

export interface SkillToConversationsMapper {
    delegationMap:Map<string, DelegationData>;
}