//install first: npm install gulp gulp-uglify gulp-clean-css gulp-rename --save-dev
var gulp = require('gulp'),

    uglify = require('gulp-uglify'),

	cleancss = require('gulp-clean-css'),

    rename = require('gulp-rename');


//compress js code
gulp.task('minifyjs', function() {

	gulp.src('TUpload/*.js').pipe(rename({suffix:'.min'})).pipe(uglify()).pipe(gulp.dest('TUpload'));
	gulp.src('BUpload/*.js').pipe(rename({suffix:'.min'})).pipe(uglify()).pipe(gulp.dest('BUpload'));
	return true;
});

//compress css code
gulp.task('minifycss', function() {
	
	gulp.src(['TUpload/css/*.css']).pipe(rename({suffix:'.min'})).pipe(cleancss()).pipe(gulp.dest('TUpload/css'));
	gulp.src(['BUpload/css/*.css']).pipe(rename({suffix:'.min'})).pipe(cleancss()).pipe(gulp.dest('BUpload/css'));
	return true;

});

gulp.task('default', function() {
	gulp.start('minifyjs');
	gulp.start('minifycss');
});

