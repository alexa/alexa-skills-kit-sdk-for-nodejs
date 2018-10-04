'use strict';

const gulp = require('gulp');
const gulp_base = require('./gulpfile-base');
const del = require('del');

gulp.task("tsc", gulp_base.tsc);

gulp.task('tslint', gulp_base.tslint);

gulp.task('test', gulp_base.test);

gulp.task('clean', () => {
    return del(['coverage', 'dist', 'doc']);
});

gulp.task('default', gulp.series('clean', gulp.parallel('tsc', 'tslint', 'test')));
gulp.task('release', gulp.series('default'));
