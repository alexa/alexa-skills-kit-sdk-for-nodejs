'use strict';

/**
 * By Default, these events will result in a no-op. A skill can override this behavior by registering handlers
 * for these events in their skill.
 * Note: These events will never have session attributes
 */
const skillEventHandlers = {
    'AlexaSkillEvent.SkillEnabled' : function() {
    },
    'AlexaSkillEvent.SkillDisabled' : function() {
    },
    'AlexaSkillEvent.SkillPermissionAccepted' : function() {
    },
    'AlexaSkillEvent.SkillPermissionChanged' : function() {
    },
    'AlexaSkillEvent.SkillAccountLinked' : function() {
    }
};

module.exports.skillEventHandlers = skillEventHandlers;