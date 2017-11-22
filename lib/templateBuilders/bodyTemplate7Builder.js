'use strict';

const TemplateBuilder = require('./templateBuilder').TemplateBuilder;
const TextUtils = require('../utils/textUtils').TextUtils;

/**
 * Used to create BodyTemplate7 objects
 * 
 * @class BodyTemplate7Builder
 * @extends {TemplateBuilder}
 */
class BodyTemplate7Builder extends TemplateBuilder {
    constructor() {
        super();
        this.template.type = 'BodyTemplate7';
    }

    /**
     * Sets the image for the template
     * 
     * @param {any} image 
     * @returns 
     * @memberof BodyTemplate7Builder
     */
    setImage(image) {
        this.template.image = image;
        return this;
    }

    /**
     * Sets the text content for the template
     * 
     * @param {TextField} primaryText 
     * @param {TextField} secondaryText 
     * @param {TextField} tertiaryText 
     * @returns BodyTemplate7Builder
     * @memberof BodyTemplate7Builder
     */
    setTextContent(primaryText, secondaryText, tertiaryText) {
        this.template.textContent = TextUtils.makeTextContent(primaryText, secondaryText, tertiaryText);
        return this;
    }
}

module.exports.BodyTemplate7Builder = BodyTemplate7Builder;