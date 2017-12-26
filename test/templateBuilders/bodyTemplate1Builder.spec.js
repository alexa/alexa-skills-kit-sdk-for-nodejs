'use strict';

const expect = require('chai').expect;

const BodyTemplate1Builder = require('../../lib/templateBuilders/bodyTemplate1Builder').BodyTemplate1Builder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;
const TextUtils = require('../../lib/utils/textUtils').TextUtils;

describe('BodyTemplate1Builder', () => {
    it('should create BodyTemplate1', () => {
        const expectedBackButtonBehavior = 'VISIBLE';
        const expectedBgImage = ImageUtils.makeImage('url');
        const expectedPrimaryText = TextUtils.makePlainText('text');
        const expectedTitle = 'title';
        const expectedToken = 'token';

        const template = new BodyTemplate1Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTextContent(expectedPrimaryText)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .build();
        
        expect(template.type).to.equal('BodyTemplate1');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.equal(expectedBgImage);
        expect(template.textContent.primaryText).to.equal(expectedPrimaryText);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
    });
});