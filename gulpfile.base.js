'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const jshint = require('gulp-jshint');

module.exports = {
    lint : () => {
        return gulp.src(['lib/**/*.js', 'test/**/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter('default'));
    }
};