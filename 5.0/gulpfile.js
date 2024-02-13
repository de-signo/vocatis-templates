/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { deleteSync as del } from "del";
import gulp from "gulp";
import cleanCSS from "gulp-clean-css";
import { exec } from "child_process";
import git from "gulp-git";
import hb from "gulp-compile-handlebars";
import log from "fancy-log";
import rename from "gulp-rename";
import gulp_sass from "gulp-sass";
import mod_sass from "sass";
let sass = gulp_sass(mod_sass);
import zip from "gulp-zip";
import debug from "gulp-debug";
import merge from "merge-stream";
import handlebars_helper_range from "handlebars-helper-range";

hb.Handlebars.registerHelper("range", handlebars_helper_range);

const customersuffix = "";
const customername = "";

let specs = [
  {
    name: "display",
    ng: ["display"],
    clean: "../dist/display_*.zip",
    files: ["display/dist/display/**"],
    templates: ["display/src/Styles.xml.handlebars"],
    templateData: {
      suffix: customersuffix,
      option_name: customername,
    },
  },
  {
    name: "display-popup",
    ng: ["display-popup"],
    clean: "../dist/display-popup_*.zip",
    files: ["display-popup/dist/display-popup/**"],
    templates: ["display-popup/src/Styles.xml.handlebars"],
    templateData: {
      suffix: customersuffix,
      option_name: customername,
    },
  },
  {
    name: "appointment-ui",
    ng: ["appointment-ui"],
    clean: "../dist/appointment-ui_*.zip",
    files: ["appointment-ui/dist/appointment-ui/**"],
    templates: ["appointment-ui/src/Styles.xml.handlebars"],
    templateData: {
      suffix: customersuffix,
      option_name: customername,
    },
  },
  {
    name: "printer_groups",
    ng: ["printer", { path: "printer", project: "app" }],
    clean: "../dist/printergroups*.zip",
    files: ["printer/dist/**", "!printer/dist/printer/assets/test*.json"],
    templates: [
      { input: "printer/Styles.xml.handlebars", dest: "printer/dist" },
      "printer/src/environments/environment.prod.ts.handlebars",
      "printer/app_src/environments/environment.prod.ts.handlebars",
    ],
    templateData: {
      suffix: "_openclose" + customersuffix,
      option_name: customername,
      use_groups_config: true,
      enable_app: true,
      enable_open_close: true,
    },
  },
];

// printer option generator
// make sure test defaults are specified last
let options = [
  // app
  [
    {
      tag: "noapp",
      templateData: {
        use_groups_config: false,
        enable_app: false,
      },
      files: ["!printer/dist/app/**"],
    },
    {
      tag: "app",
      name: "app",
      ng: [{ path: "printer", project: "app" }],
      templateData: {
        use_groups_config: false,
        enable_app: true,
      },
    },
  ],
];

// init options
var printerSpecs = [
  {
    name: "printer",
    clean: "../dist/printer_*.zip",
    files: ["printer/dist/**", "!printer/dist/printer/assets/test*.json"],
    ng: ["printer"],
    templates: [
      { input: "printer/Styles.xml.handlebars", dest: "printer/dist" },
      "printer/src/environments/environment.prod.ts.handlebars",
      "printer/app_src/environments/environment.prod.ts.handlebars",
    ],
    templateData: {
      suffix: customersuffix,
      option_name: customername,
      enable_open_close: true,
    },
  },
];
for (let option of options) {
  var variantSpecs = [];
  for (let variant of option) {
    for (let s of printerSpecs) {
      // clone
      var vs = {};
      Object.assign(vs, s);
      vs.templateData = {};
      Object.assign(vs.templateData, s.templateData);

      // apply variant
      vs.name = s.name + "_" + variant.tag;
      vs.templateData.suffix = vs.name;
      if (variant.templateData) {
        Object.assign(vs.templateData, variant.templateData);
      }
      if (variant.name) {
        vs.templateData.option_name =
          vs.templateData.option_name + " " + variant.name;
      }
      if (variant.files) {
        vs.files = vs.files.concat(variant.files);
      }
      if (variant.ng) {
        vs.ng = vs.ng.concat(variant.ng);
      }
      variantSpecs.push(vs);
    }
  }
  printerSpecs = variantSpecs;
}
specs = specs.concat(printerSpecs);
log("Specs: ", printerSpecs);

// create packages
gulp.task("clean_zip", function (done) {
  for (let spec of specs) {
    if (spec["clean"]) {
      del(spec["clean"], { force: true });
    }
  }
  done();
});

gulp.task("build_libs", function (cb) {
  exec(`ng build`, { cwd: "../lib/vocatis" }, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

var version;
gulp.task("read_version", function (done) {
  git.exec(
    {
      args: "describe --tags --dirty",
      quiet: true,
    },
    (err, out) => {
      version = out.trim();
      done();
    },
  );
});

let zip_tasks = [];
for (let spec of specs) {
  // context for tasks
  (function (spec) {
    var name = spec["name"];
    var task_name = `zip_${name}`;
    zip_tasks.push(task_name);

    var tasks = [];

    // template task
    if (spec["templates"]) {
      gulp.task(`template_${name}`, () => {
        var hbData = {
          version: version,
        };
        var hbOptions = {};
        if (spec["templateData"]) {
          Object.assign(hbData, spec["templateData"]);
        }
        var templateObj = spec["templates"].filter(
          (t) => typeof t === "object",
        );
        var templateStr = spec["templates"].filter(
          (t) => typeof t !== "object",
        );
        var streams = [];
        streams.push(
          gulp
            .src(templateStr, { base: "./" }, { removeBOM: false })
            .pipe(hb(hbData, hbOptions))
            .pipe(
              rename(function (path) {
                path.extname = "";
              }),
            )
            .pipe(gulp.dest(".")),
        );
        templateObj.forEach((t) => {
          streams.push(
            gulp
              .src(t.input, { base: "./" }, { removeBOM: false })
              .pipe(hb(hbData, hbOptions))
              .pipe(
                rename(function (path) {
                  path.extname = "";
                  path.dirname = "";
                }),
              )
              .pipe(gulp.dest(t.dest)),
          );
        });
        return merge(streams);
      });
      tasks.push(`template_${name}`);
    }

    // angular task
    if (spec["ng"]) {
      spec["ng"].forEach(function (ng) {
        let ngTaskName;
        if (typeof ng === "object") {
          ngTaskName = `ng_${name}_${ng.path}_${ng.project}`;
          gulp.task(ngTaskName, function (cb) {
            exec(
              `ng build ${ng.project}`,
              { cwd: ng.path },
              function (err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                cb(err);
              },
            );
          });
        } else {
          ngTaskName = `ng_${name}_${ng}`;
          gulp.task(ngTaskName, function (cb) {
            exec(`ng build ${ng}`, { cwd: ng }, function (err, stdout, stderr) {
              console.log(stdout);
              console.log(stderr);
              cb(err);
            });
          });
        }
        tasks.push(ngTaskName);
      });
    }

    // zip task
    const zipitTaskName = `zipit_${name}`;
    gulp.task(zipitTaskName, function () {
      return gulp
        .src(spec["files"], { removeBOM: false })
        .pipe(zip(`${name}_${version}.zip`))
        .pipe(gulp.dest("../dist"));
    });
    tasks.push(zipitTaskName);

    // execut the tasks
    if (tasks.length > 1) gulp.task(task_name, gulp.series(tasks));
    else gulp.task(task_name, tasks[0]);
  })(spec);
}

gulp.task(
  "zip",
  gulp.series(
    "clean_zip",
    "read_version",
    "build_libs",
    gulp.series(zip_tasks),
  ),
);
gulp.task("default", gulp.series(["zip"]));
