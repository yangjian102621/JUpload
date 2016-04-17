//install first: npm install gulp gulp-uglify gulp-clean-css gulp-rename --save-dev
var gulp = require('gulp'),

    uglify = require('gulp-uglify'),

	cleancss = require('gulp-clean-css'),

    rename = require('gulp-rename');


//compress js code
gulp.task('minifyjs', function() {

	return gulp.src('src/*.js')
			   .pipe(rename({suffix:'.min'}))
			   .pipe(uglify())
			   .pipe(gulp.dest('dist'));
});

//compress css code
gulp.task('minifycss', function() {
	
	gulp.src('src/skin/*.png').pipe(gulp.dest('dist/skin'));

	return gulp.src('src/skin/*.css')
				.pipe(rename({suffix:'.min'}))
				.pipe(cleancss())
				.pipe(gulp.dest('dist/skin'));

});

gulp.task('default', function() {
	gulp.start('minifyjs');
	gulp.start('minifycss');
});

