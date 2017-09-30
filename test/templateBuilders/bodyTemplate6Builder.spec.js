'use strict';

const expect = require('chai').expect;

const BodyTemplate6Builder = require('../../lib/templateBuilders/bodyTemplate6Builder').BodyTemplate6Builder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;
const TextUtils = require('../../lib/utils/textUtils').TextUtils;

describe('BodyTemplate6Builder', () => {
    it('should create BodyTemplate6', () => {
        const expectedBackButtonBehavior = 'HIDDEN';
        const expectedBgImage = ImageUtils.makeImage('url', 800, 600, 'LARGE', 'image desc');
        const expectedPrimaryText = TextUtils.makePlainText('text');
        const expectedSecondaryText = TextUtils.makePlainText('secondary text');
        const expectedTertiaryText = TextUtils.makeRichText('tertiary text');
        const expectedTitle = 'title';
        const expectedToken = 'token';
        const expectedFgImage = ImageUtils.makeImage('url2');

        const template = new BodyTemplate6Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTextContent(expectedPrimaryText, expectedSecondaryText, expectedTertiaryText)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .setImage(expectedFgImage)
                                    .build();
        
        expect(template.type).to.equal('BodyTemplate6');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.deep.equal(expectedBgImage);
        expect(template.textContent.primaryText).to.deep.equal(expectedPrimaryText);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
        expect(template.image).to.deep.equal(expectedFgImage);
    });
});