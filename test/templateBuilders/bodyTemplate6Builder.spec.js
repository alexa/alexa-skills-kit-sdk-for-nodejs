'use strict';

const expect = require('chai').expect;

const BodyTemplate6Builder = require('../../lib/templateBuilders/bodyTemplate6Builder').BodyTemplate6Builder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;
const TextUtils = require('../../lib/utils/textUtils').TextUtils;

describe('BodyTemplate6Builder', () => {
    it('should create BodyTemplate6', () => {
        const expectedBackButtonBehavior = 'HIDDEN';
        const expectedBgImage = ImageUtils.makeImage('url');
        const expectedPrimaryText = TextUtils.makePlainText('text');
        const expectedTitle = 'title';
        const expectedToken = 'token';
        const expectedFgImage = ImageUtils.makeImage('url2');

        const template = new BodyTemplate6Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTextContent(expectedPrimaryText)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .setImage(expectedFgImage)
                                    .build();
        
        expect(template.type).to.equal('BodyTemplate6');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.equal(expectedBgImage);
        expect(template.textContent.primaryText).to.equal(expectedPrimaryText);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
        expect(template.image).to.equal(expectedFgImage);
    });
});