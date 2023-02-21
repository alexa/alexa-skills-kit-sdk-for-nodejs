import { Intent, Slot } from "ask-sdk-model";

export interface DelegationData {
    delegateTarget: DelegateTarget;
    intentData? : Intent;
    acirData? : any;
}

export declare type target = 'Conversations' | 'Component' | 'Skill';

export interface DelegateTarget {
    type: target;
    name: string;
    slots? : {[key : string] : Slot}
}

export interface SkillToConversationsMapper {
    delegationMap:Map<string, DelegationData>;
}