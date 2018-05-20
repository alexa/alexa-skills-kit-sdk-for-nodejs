'use strict';

const TemplateBuilder = require('./templateBuilder').TemplateBuilder;

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
}

module.exports.BodyTemplate7Builder = BodyTemplate7Builder;