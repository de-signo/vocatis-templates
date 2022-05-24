
var gulp = require("gulp"),
cleanCSS = require("gulp-clean-css"),
del = require("del"),
exec = require('child_process').exec,
git = require("gulp-git"),
hb = require("gulp-compile-handlebars"),
log = require('fancy-log');
rename = require("gulp-rename"),
sass = require('gulp-sass')(require('sass')),
zip = require("gulp-zip");

hb.Handlebars.registerHelper('range', require('handlebars-helper-range'));

// compile styles
gulp.task("css", function (done) {
gulp.src(['styles/queueinfo.scss'])
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('queueinfo'));
done();
});

specs = [
  {
    'name': "import",
    'clean': "../dist/import_*.zip",
    'files': ['import/**', '!import/*.handlebars'],
    'templates': ['import/Styles.xml.handlebars']
  },
  {
    'name': "display",
    'ng': ['display'],
    'clean': "../dist/display_*.zip",
    'files': ['display/dist/display/**'],
    'templates': ['display/src/Styles.xml.handlebars']
  },
  {
    'name': "queueinfo",
    'clean': "../dist/queueinfo_*.zip",
    'files': ['queueinfo/**', '!queueinfo/*.handlebars'],
    'templates': ['queueinfo/Styles.xml.handlebars']
  },
  {
    'name': "printer_groups_nomultilang",
    'ng': ['printer'],
    'clean': "../dist/printergroups_*.zip",
    'files': ['printer/dist/**', "!printer/dist/app/**", "!printer/dist/printer/assets/test*.json"],
    'templates': [{input: 'printer/Styles.xml.handlebars', dest: 'printer/dist'}, 'printer/src/environments/environment.prod.ts.handlebars', 'printer/app_src/environments/environment.prod.ts.handlebars'],
    'templateData': {
      'suffix': '_openclose_nomultilang',
      'use_groups_config': true,
      'enable_app': false,
      'enable_open_close': true,
      'multilang': false
    }
  }
];

// printer option generator
// make sure test defaults are specified last
options = [
  // app
  [
    {'tag': 'noapp',
     'ng': [{'path': 'printer', 'project': 'app'}],
    'templateData': {
      'use_groups_config': false,
      'enable_app': false },
      'files': ["!printer/dist/app/**"]
    },
    {'tag': 'app', 'name': 'app',
    'templateData': {
      'use_groups_config': false,
      'enable_app': true }
    }
  ],
  // openclose
  [
    {'tag':'nomultilang', 'templateData': { multilang: false }},
    {'tag':'multilang', 'name': 'multilang', 'templateData': { multilang: true }},
  ],
];

// init options
var printerSpecs = [{
  'name': 'printer',
  'clean': "../dist/printer_*.zip",
  'files': ['printer/dist/**', "!printer/dist/printer/assets/test*.json"],
  'ng': ['printer'],
  'templates': [{input: 'printer/Styles.xml.handlebars', dest: 'printer/dist'}, 'printer/src/environments/environment.prod.ts.handlebars'],
  'templateData': {
    'option_name': '',
    enable_open_close: true
  }
}];
for (option of options) {
  var variantSpecs = [];
  for (variant of option) {
    for (s of printerSpecs)
    {
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
        vs.templateData.option_name = vs.templateData.option_name + " " + variant.name;
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
gulp.task("clean_zip", function(done) {
  for (spec of specs)
  {
    if (spec['clean'])
    {
      del(spec['clean'],  { 'force': true });
    }
  }
  done();
});


var version;
gulp.task("read_version", function(done) {
  git.exec({
    args: 'describe --tags --dirty',
    quiet: true
  }, (err, out) => {
    version = out.trim();
    done()
  });
});

zip_tasks = [];
for (spec of specs) {
  // context for tasks
  (function (spec) {
    var name = spec['name'];
    var task_name = `zip_${name}`;
    zip_tasks.push(task_name);

    var tasks = [];

    // template task
    if (spec['templates'])
    {
      gulp.task(`template_${name}`, (done) => {
        var hbData = {
          'version': version
        }
        var hbOptions = {};
        if (spec['templateData']) {
          Object.assign(hbData, spec['templateData']);
        }
        var templateObj = spec["templates"].filter(t => typeof t === 'object')
        var templateStr = spec["templates"].filter(t => typeof t !== 'object')
        gulp.src(templateStr, {base:"./"}, {removeBOM: false})
          .pipe(hb(hbData, hbOptions))
          .pipe(rename(function (path) { path.extname = ""; }))
          .pipe(gulp.dest('.'));
        templateObj.forEach(t => {
          gulp.src(t.input, {base:"./"}, {removeBOM: false})
            .pipe(hb(hbData, hbOptions))
            .pipe(rename(function (path) { path.extname = ""; path.dirname = "";}))
            .pipe(gulp.dest(t.dest))
          });
        done();
      });
      tasks.push(`template_${name}`);
    }

    // angular task
    if (spec['ng'])
    {
      spec['ng'].forEach(function(ng) {
        let ngTaskName;
        if (typeof ng === 'object') {
          ngTaskName = `ng_${name}_${ng.path}_${ng.project}`;
          gulp.task(ngTaskName, function (cb) {
            exec(`ng build ${ng.project}`, { 'cwd': ng.path }, function (err, stdout, stderr) {
              console.log(stdout);
              console.log(stderr);
              cb(err);
            });
          });
        }
        else {
          ngTaskName = `ng_${name}_${ng}`;
          gulp.task(ngTaskName, function (cb) {
            exec('ng build', { 'cwd': ng }, function (err, stdout, stderr) {
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
    var zipit = () => gulp.src(spec['files'], {removeBOM: false})
      .pipe(zip(`${name}_${version}.zip`))
      .pipe(gulp.dest("../dist"));
    tasks.push(zipit);

    // execut the tasks
    if (tasks.length > 1)
      gulp.task(task_name, gulp.series(tasks));
    else
      gulp.task(task_name, tasks[0]);

  }) (spec);
}

gulp.task("zip", gulp.series('clean_zip', 'read_version', gulp.series(zip_tasks)));
gulp.task('default', gulp.series(['css', 'zip']));
