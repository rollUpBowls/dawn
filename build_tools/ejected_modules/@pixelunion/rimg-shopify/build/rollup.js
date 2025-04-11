var fs = require('fs');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var commonjs = require('rollup-plugin-commonjs');
var resolve = require('rollup-plugin-node-resolve');
var uglify = require('./uglify');
var pkg = require('../package.json');

var banner =
  '/*!\n' +
  ' * ' + pkg.name + ' v' + pkg.version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' ' + pkg.author + '\n' +
  ' */'

rollup.rollup({
  input: 'src/index.js',
  plugins: [
    babel(),
    commonjs(),
    resolve()
  ],
  external: ['rimg']
}).then(function(bundle){

  // Write ES module bundle
  bundle.write({
    format: 'es',
    file: pkg.module,
    banner
  })
  .then(report(pkg.module));

  // Write CommonJS bundle
  bundle.write({
    format: 'cjs',
    file: pkg.main,
    banner
  })
  .then(report(pkg.main));

  // Write UMD bundles
  var umdFile = pkg.main.replace('.js', '.umd.js');
  var minFile = pkg.main.replace('.js', '.umd.min.js');
  var umdName = 'rimg.shopify';
  bundle.write({
    format: 'umd',
    file: umdFile,
    name: umdName,
    banner
  })
  .then(report(umdFile))
  .then(function(){
    uglify(umdFile, minFile);
  })
  .then(report(minFile));

}).catch(warn);

function warn(error) {
  console.log(error.stack);
}

function report(file) {
  var before;

  try {
    before = fs.statSync(file).size;
  } catch (err) {
    before = 0;
  }

  return function() {
    var after = fs.statSync(file).size;
    console.log(after, after - before, file);
  }
}
