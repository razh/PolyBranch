'use strict';

var PORT = process.env.PORT || 3000;

var SOURCE_DIR = './src';
var BUILD_DIR = 'dist';

var _ = require('lodash');
var argv = require('yargs').argv;
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var bundleCollapser = require('bundle-collapser/plugin');
var del = require('del');
var glslify = require('glslify');
var nib = require('nib');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var production = false;

function onError(error) {
  $.util.log(error.message);
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
    var bundler = browserify(SOURCE_DIR + src,
      _.assign({
        debug: argv.debug
      }, production ? {} : watchify.args));

    if (!production) {
      bundler = watchify(bundler, { delay: argv.delay });
    } else {
      bundler.plugin(bundleCollapser);
    }

    bundler
      .transform(babelify)
      .transform(glslify);

    function rebundle() {
      return bundler.bundle()
        .on('error', onError)
        .pipe(source(dest))
        .pipe($.buffer())
        .pipe($.if(production, $.uglify()))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe($.if(!production, browserSync.reload({stream: true, once: true})));
    }

    bundler
      .on('log', $.util.log)
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
  return gulp.src(SOURCE_DIR + '/css/*.styl')
    .pipe($.stylus({
      'include css': true,
      use: [nib()]
    }))
    .on('error', onError)
    .pipe($.autoprefixer())
    .pipe($.if(production, $.csso()))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe($.if(!production, browserSync.reload({stream: true})));
});

gulp.task('watch', function() {
  gulp.watch([SOURCE_DIR + '/*.html'], ['html']);
  gulp.watch([SOURCE_DIR + '/css/*.styl'], ['css']);
});

gulp.task('clean', del.bind(null, [BUILD_DIR]));

gulp.task('default', ['clean'], function(cb) {
  return runSequence(
    ['html', 'css', 'js', 'tests'],
    ['browser-sync', 'watch'],
    cb
  );
});

gulp.task('build', ['clean'], function(cb) {
  production = true;

  return runSequence(
    ['html', 'css', 'js'],
    cb
  );
});
