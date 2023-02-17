import { IntentRequest, Slot } from "ask-sdk-model";
import { HandlerInput } from "../dispatcher/request/handler/HandlerInput";
import { DelegateTarget, DelegationData, SkillToConversationsMapper } from "../delegation/DelegationData";

export function getSkillToConversationMapper(mapDir:string):SkillToConversationsMapper {
    const delegationMap:Map<string, DelegationData> = new Map();
    const mappings = require(mapDir);
    Object.keys(mappings.skillToConversations).forEach((intentName) => {
        const delegationInfo:DelegationData = mappings.skillToConversations[intentName];
        delegationMap.set(intentName, delegationInfo);
    });
    return {
        delegationMap
    };
}

export function getDelegateTarget(delegationInfo : DelegationData) : DelegateTarget {
    return delegationInfo.delegateTarget;
}

export function getDelegateTargetType(delegateTarget : DelegateTarget) : string {
    return delegateTarget.type;
}

export function getDelegateTargetName(delegateTarget : DelegateTarget) : string {
    return delegateTarget.name;
}

export function getDelegateTargetSlots(delegateTarget : DelegateTarget) : {[key : string] : Slot} | undefined {
    return delegateTarget.slots;
}

export function getDelegationMap(skillToConversationsMapper: SkillToConversationsMapper)
    : Map<string, DelegationData> {
    return skillToConversationsMapper.delegationMap;
}

export function getSlotsForComponent(intentSlots: {[key : string] : Slot},
                                     delegateTargetSlots: {[key : string] : Slot} | undefined)
    : {[key : string] : Slot} {
    if (!intentSlots || !delegateTargetSlots) {
        return {};
    }
    const filledSlots: {[key : string] : Slot} = {};
    Object.keys(delegateTargetSlots).forEach((slotKey) => {
        const slot: Slot | undefined = intentSlots[slotKey];
        if (slot && slot.value) {
            filledSlots[slotKey] = slot;
        }
    });
    return filledSlots;
}

export function storeIntentSlotsInSession(input: HandlerInput, intentName: string) {
    const sessionAttributes = input.attributesManager.getSessionAttributes();
    const slots: {[key : string] : Slot} = (input.requestEnvelope.request as IntentRequest).intent.slots;
    if (!slots) {
        return;
    }
    sessionAttributes[intentName] = slots;
    input.attributesManager.setSessionAttributes(sessionAttributes);
}