
var gulp = require("gulp"),
cleanCSS = require("gulp-clean-css"),
del = require("del"),
git = require("gulp-git"),
hb = require("gulp-compile-handlebars"),
log = require('fancy-log');
rename = require("gulp-rename"),
sass = require('gulp-sass'),
zip = require("gulp-zip");

hb.Handlebars.registerHelper('range', require('handlebars-helper-range'));
sass.compiler = require('node-sass');

// compile styles
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

specs = [
  {
    'name': "import",
    'clean': "../dist/import_*.zip",
    'files': ['import/**', '!import/*.handlebars'],
    'templates': ['import/Styles.xml.handlebars']
  },
  {
    'name': "display",
    'clean': "../dist/display_*.zip",
    'files': ['display/**', '!display/*.handlebars'],
    'templates': ['display/Styles.xml.handlebars']
  },
  {
    'name': "queueinfo",
    'clean': "../dist/queueinfo_*.zip",
    'files': ['queueinfo/**', '!queueinfo/*.handlebars'],
    'templates': ['queueinfo/Styles.xml.handlebars']
  }
];

// printer option generator
// make sure test defaults are specified last
options = [
  // openclose
  [
    {'tag':'noopenclose', 'templateData': { enable_open_close: false }},
    {'tag':'openclose', 'name': 'open/close', 'templateData': { enable_open_close: true }},
  ],
  // app
  [
    {'tag': 'noapp',
    'templateData': {
      'enable_app': false,
      'ticket_show_qr_code': false,
      'list_print_or_scan': false,
      'appointment_print_or_scan': false},
      'files': ['!printer/App*.cshtml', '!printer/app.css']
    },
    {'tag': 'app_noprintorscan', 'name': 'app',
    'templateData': {
      'enable_app': true,
      'ticket_show_qr_code': true,
      'list_print_or_scan': false,
      'appointment_print_or_scan': false}
    },
    {'tag': 'app_printorscan', 'name': 'app print or scan',
    'templateData': {
      'enable_app': true,
      'ticket_show_qr_code': true,
      'list_print_or_scan': true,
      'appointment_print_or_scan': true}
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
  'files': ['printer/**', '!printer/*.handlebars'],
  'templates': ['printer/Styles.xml.handlebars', 'printer/_PageStart.cshtml.handlebars'],
  'templateData': { 'option_name': ''}
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

    var zipit = () => gulp.src(spec['files'], {removeBOM: false})
      .pipe(zip(`${name}_${version}.zip`))
      .pipe(gulp.dest("../dist"));

    if (spec['templates'])
    {
      gulp.task(`template_${name}`, () => {
        var hbData = {
          'version': version
        }
        var hbOptions = {};
        if (spec['templateData']) {
          Object.assign(hbData, spec['templateData']);
        }  
        return gulp.src(spec['templates'], {base:"./"}, {removeBOM: false})
          .pipe(hb(hbData, hbOptions))
          .pipe(rename(function (path) { path.extname = ""; }))
          .pipe(gulp.dest('.'));
      });
      gulp.task(task_name, gulp.series(`template_${name}`, zipit));
    }
    else
    {
      gulp.task(task_name, zipit);
    }
  }) (spec);
}

gulp.task("zip", gulp.series('clean_zip', 'read_version', gulp.series(zip_tasks)));
gulp.task('default', gulp.series(['css', 'zip']));
