'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');

var src = {
  assets: ['app/assets/js/**/*.js', 'app/assets/css/**/*.css'],
  html: ['app/*.html']
};

gulp.task('connect', function() {
  return connect.server({
    root: 'app',
    port: 5000,
    livereload: true
  });
});

gulp.task('assets', function() {
  return gulp.src(src.assets)
  .pipe(connect.reload());
});

gulp.task('html', function() {
  return gulp.src(src.html)
  .pipe(connect.reload());
});

gulp.task('assets:watch',function() {
  return gulp.watch(src.assets, ['assets']);
});

gulp.task('html:watch',function() {
  return gulp.watch(src.html, ['html']);
});

gulp.task('server', ['connect', 'assets:watch', 'html:watch']);
