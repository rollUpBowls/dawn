// grab our gulp packages
const gulp = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const rename = require('gulp-rename');
const exec = require('gulp-exec');
const named = require('vinyl-named');
const compiler = require('webpack');
const webpack = require('webpack-stream');

const handleError = error => {
  console.log(error.toString());
  this.emit('end');
};

let DEST;

// Destination path will vary depending on where this script is run from.
try {
  DEST = require('./assetsPath').assetsPath;
} catch (e) {
  DEST = 'assets/';
}

const compileEjectedStyles = () => gulp.src('./').pipe(exec('npm run buildStyles')).pipe(exec.reporter());

const compileAppJs = done => {
  gulp.src('source/scripts/app.js')
    .pipe(named())
    .pipe(webpack({
      mode: 'production',
      externals: {
        jquery: 'jQuery',
      },
      optimization: {
        minimize: false,
      },
    }, compiler))
    .pipe(changed(DEST))
    .on('error', handleError)
    .pipe(rename({
      extname: '.js.liquid',
    }))
    .pipe(gulp.dest(DEST))
    .on('end', done);
};

const compileSectionsJs = done => {
  gulp.src('source/scripts/sections/*.js')
    .pipe(named())
    .pipe(webpack({
      mode: 'production',
      externals: {
        jquery: 'jQuery',
      },
      optimization: {
        minimize: false,
      },
    }, compiler))
    .pipe(changed(DEST))
    .on('error', handleError)
    .pipe(rename({
      prefix: 'z__',
    }))
    .pipe(gulp.dest(DEST))
    .on('end', done);
};

const combineVendorsJs = done => {
  gulp.src([
    // Vendors
    'source/scripts/vendors/instant-page.js',
    'source/scripts/vendors/lazysizes.min.js',
    'source/scripts/vendors/flickity.js',
    'source/scripts/vendors/fancybox.js',
    'source/scripts/vendors/jsurl.js',
    'source/scripts/vendors/stickykit.js',
    'source/scripts/vendors/zoom.js',
    'source/scripts/vendors/waypoints.js',
    'source/scripts/vendors/jquery.sticky.js',
    'source/scripts/vendors/js.cookie.js',
    'source/scripts/vendors/isotope.min.js',
    'source/scripts/vendors/modernizr.js',
    'source/scripts/vendors/jquery.offscreen.js',
    'source/scripts/vendors/lazyframe.js',
    'source/scripts/vendors/theme-addresses.min.js',
    'source/scripts/vendors/plyr.js',
  ])
    .pipe(concat('vendors.js'))
    .on('error', handleError)
    .pipe(gulp.dest(DEST))
    .on('end', done);
};

const combineUtilitiesJs = done => {
  gulp.src([
    // Utilities
    'source/scripts/utilities/contentCreatorAccordion.js',
    'source/scripts/utilities/contentCreatorSlideshow.js',
    'source/scripts/utilities/animation.js',
    'source/scripts/utilities/asyncView.js',
    'source/scripts/utilities/addImageSize.js',
    'source/scripts/utilities/breadcrumbs.js',
    'source/scripts/utilities/debounce.js',
    'source/scripts/utilities/disclosure.js',
    'source/scripts/utilities/dropdownMenu.js',
    'source/scripts/utilities/collapsibleRow.js',
    'source/scripts/utilities/newsletterAjaxForm.js',
    'source/scripts/utilities/getSectionData.js',
    'source/scripts/utilities/infiniteScroll.js',
    'source/scripts/utilities/ios-scroll-fix.js',
    'source/scripts/utilities/loadScript.js',
    'source/scripts/utilities/masonry.js',
    'source/scripts/utilities/mobileMenu.js',
    'source/scripts/utilities/option_selection.js',
    'source/scripts/utilities/productMedia.js',
    'source/scripts/utilities/productReviews.js',
    'source/scripts/utilities/quantityBox.js',
    'source/scripts/utilities/queryParameters.js',
    'source/scripts/utilities/responsiveVideo.js',
    'source/scripts/utilities/selectCallback.js',
    'source/scripts/utilities/predictiveSearch.js',
    'source/scripts/utilities/screenSize.js',
    'source/scripts/utilities/scrollToTop.js',
    'source/scripts/utilities/tabs.js',
    'source/scripts/utilities/thumbnail.js',
    'source/scripts/utilities/video.js',
  ])
    .pipe(concat('utilities.js'))
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .on('error', handleError)
    .pipe(gulp.dest(DEST))
    .on('end', done);
};

const combineCurrencyConversionJs = done => {
  gulp.src([
    // Currency conversion
    'source/scripts/currencyConversion/moneyFormats.js',
    'source/scripts/currencyConversion/currencyConverter.js',
  ])
    .pipe(concat('currencyConversion.js'))
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .on('error', handleError)
    .pipe(gulp.dest(DEST))
    .on('end', done);
};

const buildScripts = gulp
  .parallel(
    combineVendorsJs,
    combineUtilitiesJs,
    combineCurrencyConversionJs,
    compileSectionsJs,
    compileAppJs,
  );

gulp.task('build_scripts', gulp.parallel(buildScripts));

gulp.task('watch',
  gulp
    .series(
      gulp.parallel(buildScripts, compileEjectedStyles),
      done => {
        gulp.watch('source/scripts/vendors/*.js', gulp.parallel(combineVendorsJs));
        gulp.watch('source/scripts/utilities/*.js', gulp.parallel(combineUtilitiesJs));
        gulp.watch('source/scripts/currencyConversion/*.js', gulp.parallel(combineCurrencyConversionJs));
        gulp.watch('source/scripts/sections/*.js', gulp.parallel(compileSectionsJs));
        gulp.watch('source/scripts/app.js', gulp.parallel(compileAppJs));
        gulp.watch('source/styles/**/*', gulp.parallel(compileEjectedStyles));
        done();
      },
    ));

module.exports = () => new Promise(resolve => buildScripts(resolve));
