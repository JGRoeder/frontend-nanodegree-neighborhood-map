// Load the plugins
var gulp = require('gulp'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  htmlmin = require('gulp-minify-html'),
  del = require('del'),
  newer = require('gulp-newer'),
  browserify = require('browserify'),
  through2 = require('through2'),
  inject = require('gulp-inject'),
  uglify = require('gulp-uglify'),
  svgstore = require('gulp-svgstore');


var config = require('./build.config.json');

//----------------------------------------------
//  Paths
//----------------------------------------------

var build_paths = {
  css: 'src/css/main.scss',
  vendorJs: 'src/js/vendor/*.*',
  js: 'src/js/app.js',
  images: 'src/img/**/*',
  templates: 'src/templates/*.*',
  index: 'src/index.html',
  svg: 'src/icons/*.svg'
};


//----------------------------------------------
//  Utilities
//----------------------------------------------

// Clean our build directory
gulp.task('clean-build', function(cb){
  del('build/*', cb);
});

//----------------------------------------------
//  Build Tasks
//----------------------------------------------

gulp.task('build-css', function(){
  return gulp.src(build_paths.css)
    .pipe(scss({ style: 'expanded' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(minifycss())
    .pipe(gulp.dest('build/css'));
});

gulp.task('build-js', function () {
  gulp.src(build_paths.js)
    .pipe(through2.obj(function (file, enc, next){
            browserify(file.path)
                .transform('brfs')
                .bundle(function(err, res){
                    // assumes file.contents is a Buffer
                    file.contents = res;
                    next(null, file);
                });
        }))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});
gulp.task('build-templates', function(){
  return gulp.src(build_paths.templates)
    .pipe(htmlmin({ empty: true, comments: true, quotes: true}))
    .pipe(gulp.dest('build/templates'));
});

gulp.task('build-images', function(){
  return gulp.src(build_paths.images)
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('build-svg', function(){
  var svgs = gulp
    .src(build_paths.svg)
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents (filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src(build_paths.index)
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(htmlmin({ empty: true, comments: true, quotes: true}))
    .pipe(gulp.dest('build/'));
});

//----------------------------------------------
//  Watch
//----------------------------------------------

gulp.task('watch-build', function(){

  gulp.watch(build_paths.css, ['build-css']);
  gulp.watch(build_paths.js, ['build-js']);
  //gulp.watch(build_paths.vendorJs, ['build-vendor-js']);
  gulp.watch(build_paths.index, ['build-svg']);
  gulp.watch(build_paths.images, ['build-images']);
  gulp.watch(build_paths.views, ['build-views']);
  gulp.watch(build_paths.svg, ['build-svg']);

});

//----------------------------------------------
//  User Tasks
//----------------------------------------------

// gulp.task('build', ['build-css', 'build-js', 'build-templates', 'build-index', 'build-images', 'build-svg']);
gulp.task('build', ['build-css', 'build-js', 'build-templates', 'build-images', 'build-svg']);
gulp.task('watch', ['build', 'watch-build']);
