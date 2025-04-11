const fs = require('fs');
const util = require('util');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve');
const uglify = require('uglify-js');
const pkg = require('./package.json');

const banner = `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 */
`;

const outputOptions = {
  es: {
    output: {
      file: pkg.module,
    },
    format: 'es',
    banner,
  },
  cjs: {
    format: 'cjs',
    file: pkg.main,
    banner,
  },
  umd: {
    format: 'umd',
    file: pkg.umd,
    name: pkg.umdName,
    banner,
  },
};

rollup.rollup({
  input: 'src/scripts/index.js',
  plugins: [
    babel(),
    commonjs(),
    resolve(),
  ],
}).then(bundle => (
  Promise.all([
    bundle.write(outputOptions.es),
    bundle.write(outputOptions.cjs),
    bundle.generate(outputOptions.umd).then(code => {
      const generatedCode = code.output[0].code; 
      const minified = uglify.minify(generatedCode);

      fs.writeFileSync(outputOptions.umd.file, generatedCode);
      fs.writeFileSync(
        outputOptions.umd.file.replace('.js', '.min.js'),
        minified.code,
      );
    }),
  ])
)).catch(reason => {
  console.error(util.inspect(reason));
  process.exit(1);
});
