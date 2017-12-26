'use strict';

const expect = require('chai').expect;

const ListItemBuilder = require('../../lib/templateBuilders/listItemBuilder').ListItemBuilder;
const ImageUtils = require('../../lib/utils/imageUtils').ImageUtils;
const TextUtils = require('../../lib/utils/textUtils').TextUtils;

describe('ListItemBuilder', () => {
    it('should initialize with 0 list items', () => {
        const listItems = new ListItemBuilder().build();

        expect(listItems.length).to.equal(0);
    });


    it('should build with a single list item', () => {
        const expectedImage = ImageUtils.makeImage('url');
        const expectedToken = 'token';
        const expectedPrimaryText = TextUtils.makePlainText('text');

        const listItems = new ListItemBuilder()
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .build();
        
        expect(listItems.length).to.equal(1);
        expect(listItems[0].image).to.equal(expectedImage);
        expect(listItems[0].token).to.equal(expectedToken);
        expect(listItems[0].textContent.primaryText).to.equal(expectedPrimaryText);
        
    });

    it('should build with multiple list items', () => {
        const expectedImage = ImageUtils.makeImage('url');
        const expectedToken = 'token';
        const expectedPrimaryText = TextUtils.makePlainText('text');

        const listItems = new ListItemBuilder()
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .build();

        expect(listItems.length).to.equal(2);        
    });
});