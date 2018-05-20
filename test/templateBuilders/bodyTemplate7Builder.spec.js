'use strict';

const expect = require('chai').expect;

const BodyTemplate7Builder = require('../../lib/templateBuilders/bodyTemplate7Builder').BodyTemplate7Builder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;

describe('BodyTemplate7Builder', () => {
    it('should create BodyTemplate7', () => {
        const expectedBackButtonBehavior = 'HIDDEN';
        const expectedBgImage = ImageUtils.makeImage('url');
        const expectedTitle = 'title';
        const expectedToken = 'token';
        const expectedFgImage = ImageUtils.makeImage('url2');

        const template = new BodyTemplate7Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .setImage(expectedFgImage)
                                    .build();
        
        expect(template.type).to.equal('BodyTemplate7');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.equal(expectedBgImage);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
        expect(template.image).to.equal(expectedFgImage);
    });
});
