const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
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
    output: {
      file: pkg.main,
    },
    format: 'cjs',
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
    nodeResolve(),
    // terser(),
  ],
}).then(bundle => (
  Promise.all([
    bundle.write(outputOptions.es),
    bundle.write(outputOptions.cjs),
    bundle.write(outputOptions.umd),
  ])
));
