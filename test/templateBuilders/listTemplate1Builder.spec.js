'use strict';

const expect = require('chai').expect;

const ListTemplate1Builder = require('../../lib/templateBuilders/listTemplate1Builder').ListTemplate1Builder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;

describe('ListTemplate1Builder', () => {
    it('should create BodyTemplate6', () => {
        const expectedBackButtonBehavior = 'HIDDEN';
        const expectedBgImage = ImageUtils.makeImage('url');
        const expectedTitle = 'title';
        const expectedToken = 'token';

        const template = new ListTemplate1Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .setListItems([])
                                    .build();
        
        expect(template.type).to.equal('ListTemplate1');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.equal(expectedBgImage);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
        expect(template.listItems.length).to.equal(0);
    });
});