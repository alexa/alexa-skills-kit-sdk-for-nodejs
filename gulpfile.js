'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const jshint = require('gulp-jshint');

gulp.task('test', () => {
    return gulp.src('test/**/*.spec.js', { read : false })
        .pipe(mocha({ reporter : 'nyan' }));
});

gulp.task('lint', () => {
    return gulp.src(['lib/**/*.js', 'test/**/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter('default'));
});

gulp.task('default', ['test', 'lint']);