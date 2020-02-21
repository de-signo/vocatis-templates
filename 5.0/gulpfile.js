
var gulp = require("gulp"),
cleanCSS = require("gulp-clean-css"),
del = require("del"),
git = require("gulp-git"),
sass = require('gulp-sass'),
zip = require("gulp-zip");

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
gulp.src(['styles/queueinfo.scss'])
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('queueinfo'));
done();
});


gulp.task("zip", function(done) {
    del(["../dist/import_*.zip",
         "../dist/display_*.zip",
         "../dist/printer_*.zip",
         "../dist/queueinfo_*.zip"], { 'force': true });
    git.exec({
        args: 'describe --tags',
        quiet: true
      }, (err, out) => {
        var version = out.trim();
        gulp.src("display/**")
            .pipe(zip(`display_${version}.zip`))
            .pipe(gulp.dest("../dist"));
        gulp.src("import/**")
            .pipe(zip(`import_${version}.zip`))
            .pipe(gulp.dest("../dist"));
        gulp.src("printer/**")
            .pipe(zip(`printer_${version}.zip`))
            .pipe(gulp.dest("../dist"));
        gulp.src("queueinfo/**")
            .pipe(zip(`queueinfo_${version}.zip`))
            .pipe(gulp.dest("../dist"));
    });
    done();
});

gulp.task('default', gulp.series(['css', 'zip']));
