import gulp from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import { exec } from "child_process";
import { deleteSync as del } from "del";

gulp.task("clean", function (done) {
  del(["../dist/*.cs"], { force: true });
  done();
});

gulp.task("add-prefix", function (done) {
  exec("git describe --tags --dirty", (error, stdout) => {
    if (error) {
      console.error(error);
      done();
      return;
    }

    const version = stdout.trim();

    const prefix = `// VERSION: ${version}`;

    return gulp
      .src("*.cs")
      .pipe(
        rename(function (path) {
          // Add the prefix to the file name
          path.basename = `${path.basename}-${version}`;
        })
      )
      .pipe(replace(/^/, prefix + "\n"))
      .pipe(gulp.dest("../dist"))
      .on("end", done);
  });
});

gulp.task("default", gulp.series(["clean", "add-prefix"]));
