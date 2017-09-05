'use strict';

/**
 * By Default, these events will result in a no-op. A skill can override this behavior by
 * overriding and registering its handlers for these events in their skill.
 * Note: these events come out of session, so they
 */
const skillEventHandlers = {
    'AlexaSkillEvent.SkillEnabled' : function() {
    },
    'AlexaSkillEvent.SkillDisabled' : function() {
    },
    'AlexaSkillEvent.SkillPermissionAccepted' : function() {
    },
    'AlexaSkillEvent.SkillPermissionRevoked' : function() {
    },
    'AlexaSkillEvent.SkillAccountLinked' : function() {
    }
};

module.exports.skillEventHandlers = skillEventHandlers;