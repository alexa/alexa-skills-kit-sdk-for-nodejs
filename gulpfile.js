'use strict';

const gulp = require('gulp');
const gulp_base = require('./gulpfile.base');

gulp.task('test', gulp_base.test);
gulp.task('lint', gulp_base.lint);

gulp.task('default', ['test', 'lint']);