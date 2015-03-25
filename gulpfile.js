'use strict';

var PORT = process.env.PORT || 3000;

var SOURCE_DIR = './src';
var BUILD_DIR = 'dist';

var _ = require('lodash');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var del = require('del');
var glslify = require('glslify');
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

function jsTask(name, src, dest) {
  return gulp.task(name, function() {
    var bundler = watchify(browserify(SOURCE_DIR + src,
      _.assign({
        debug: true
      }, watchify.args)));

    bundler
      .transform(babelify)
      .transform(glslify);

    function rebundle() {
      return bundler.bundle()
        .on('error', onError)
        .pipe(source(dest))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(browserSync.reload({stream: true, once: true}));
    }

    bundler
      .on('log', util.log)
      .on('update', rebundle);

    return rebundle();
  });
}

jsTask('js', '/js/index.js', 'bundle.js');
jsTask('tests', '/js/tests/index.js', 'tests.js');

gulp.task('html', function() {
  return gulp.src(SOURCE_DIR + '/*.html')
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.reload({stream: true, once: true}));
});

gulp.task('css', function() {
  return gulp.src(SOURCE_DIR + '/css/*.css')
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.html'], ['html']);
  gulp.watch([SOURCE_DIR + '/css/*.css'], ['css']);
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['html', 'css', 'js', 'tests'],
    ['browser-sync', 'watch'],
    cb
  );
});
