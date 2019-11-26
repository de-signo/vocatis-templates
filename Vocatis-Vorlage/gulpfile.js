
var gulp = require("gulp"),
cleanCSS = require("gulp-clean-css")
sass = require('gulp-sass');
sass.compiler = require('node-sass');


gulp.task("css", function (done) {
gulp.src(['styles/style.scss','styles/app.scss'])
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('printer'));
gulp.src(['styles/display.scss'])
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('display'));
done();
});

gulp.task('default', gulp.parallel(['css']));