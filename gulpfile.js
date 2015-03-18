'use strict';

var PORT = process.env.PORT || 3000;

var SOURCE_DIR = './src';
var BUILD_DIR = 'dist';

var _ = require('lodash');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var del = require('del');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

var gulp = require('gulp');
var util = require('gulp-util');

function onError(error) {
  util.log(error.message);
  /*jshint validthis:true*/
  this.emit('end');
}

gulp.task('browser-sync', function() {
  return browserSync({
    browser: [],
    port: PORT,
    server: {
      baseDir: './' + BUILD_DIR
    }
  });
});

gulp.task('js', function() {
  var bundler = watchify(browserify(SOURCE_DIR + '/js/index.js',
    _.assign({
      debug: true
    }, watchify.args)));

  bundler.transform(babelify);

  function rebundle() {
    return bundler.bundle()
      .on('error', onError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(BUILD_DIR))
      .pipe(browserSync.reload({stream: true, once: true}));
  }

  bundler
    .on('log', util.log)
    .on('update', rebundle);

  return rebundle();
});

gulp.task('html', function() {
  return gulp.src(SOURCE_DIR + '/*.html')
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('css', function() {
  return gulp.src(SOURCE_DIR + '/css/*.css')
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['html', 'css', 'js'],
    'browser-sync',
    cb
  );
});
