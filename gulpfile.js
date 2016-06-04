//install first: npm install gulp gulp-uglify gulp-clean-css gulp-rename --save-dev
var gulp = require('gulp'),

    uglify = require('gulp-uglify'),

	cleancss = require('gulp-clean-css'),

    rename = require('gulp-rename');


//compress js code
gulp.task('minifyjs', function() {

	gulp.src('TUpload/TUpload.js').pipe(rename({suffix:'.min'})).pipe(uglify()).pipe(gulp.dest('TUpload'));
	gulp.src('BUpload/BUpload.js').pipe(rename({suffix:'.min'})).pipe(uglify()).pipe(gulp.dest('BUpload'));
	gulp.src('JUpload/JUpload.js').pipe(rename({suffix:'.min'})).pipe(uglify()).pipe(gulp.dest('JUpload'));
	return true;
});

//compress css code
gulp.task('minifycss', function() {
	
	gulp.src(['TUpload/css/upload.css']).pipe(rename({suffix:'.min'})).pipe(cleancss()).pipe(gulp.dest('TUpload/css'));
	gulp.src(['BUpload/css/upload.css']).pipe(rename({suffix:'.min'})).pipe(cleancss()).pipe(gulp.dest('BUpload/css'));
	gulp.src(['JUpload/css/upload.css']).pipe(rename({suffix:'.min'})).pipe(cleancss()).pipe(gulp.dest('JUpload/css'));
	return true;

});

gulp.task('default', function() {
	gulp.start('minifyjs');
	gulp.start('minifycss');
});

