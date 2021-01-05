
var gulp = require("gulp"),
cleanCSS = require("gulp-clean-css"),
del = require("del"),
git = require("gulp-git"),
hb = require("gulp-compile-handlebars"),
rename = require("gulp-rename"),
sass = require('gulp-sass'),
zip = require("gulp-zip");

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

var printerSpecBase = {
  'clean': "../dist/printer_*.zip",
  'files': ['printer/**', '!printer/*.handlebars'],
  'templates': ['printer/Styles.xml.handlebars', 'printer/_PageStart.cshtml.handlebars']
};

specs.push(Object.assign({
  'name': "printer_openclose_app_noprintorscan",
  'templateData': {
    'suffix': 'printer_openclose_app_noprintorscan',
    'option_name': "open/close app",
    'ticket_show_qr_code': true,
    'list_print_or_scan': false,
    'appointment_print_or_scan': false,
    'enable_open_close': true
  }
}, printerSpecBase));

specs.push(Object.assign({
  'name': "printer_openclose_noapp",
  'templateData': {
    'suffix': 'printer_openclose_noapp',
    'option_name': "open/close app",
    'ticket_show_qr_code': false,
    'list_print_or_scan': false,
    'appointment_print_or_scan': false,
    'enable_open_close': true
  }
}, printerSpecBase));

specs.push(Object.assign({
  'name': "printer_noopenclose_app_printorscan",
  'templateData': {
    'suffix': 'printer_noopenclose_app_printorscan',
    'option_name': "app print or scan",
    'ticket_show_qr_code': true,
    'list_print_or_scan': true,
    'appointment_print_or_scan': true,
    'enable_open_close': false
  }
}, printerSpecBase));

specs.push(Object.assign({
  'name': "printer_noopenclose_app_noprintorscan",
  'templateData': {
    'suffix': 'printer_noopenclose_app_noprintorscan',
    'option_name': "app",
    'ticket_show_qr_code': true,
    'list_print_or_scan': false,
    'appointment_print_or_scan': false,
    'enable_open_close': false
  }
}, printerSpecBase));

specs.push(Object.assign({
  'name': "printer_noopenclose_noapp",
  'templateData': {
    'suffix': 'printer_noopenclose_noapp',
    'option_name': "app",
    'ticket_show_qr_code': false,
    'list_print_or_scan': false,
    'appointment_print_or_scan': false,
    'enable_open_close': false
  }
}, printerSpecBase));

// last spec with all options enabled (for testing)
specs.push(Object.assign({
  'name': "printer_openclose_app_printorscan",
  'templateData': {
    'suffix': 'printer_openclose_app_printorscan',
    'option_name': "open/close app print or scan",
    'ticket_show_qr_code': true,
    'list_print_or_scan': true,
    'appointment_print_or_scan': true,
    'enable_open_close': true
  }
}, printerSpecBase));

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
gulp.task("read_version", () =>
  git.exec({
    args: 'describe --tags',
    quiet: true
  }, (err, out) => {
    version = out.trim();
  })
);

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
