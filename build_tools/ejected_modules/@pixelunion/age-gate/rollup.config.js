import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const banner = `
/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 */
`;

export default {
  input: 'src/scripts/AgeGate.js',
  output: [
    {
      format: 'es',
      file: pkg.module,
      banner
    },
    {
      format: 'cjs',
      file: pkg.main,
      banner,
    },
    {
      format: 'umd',
      file: pkg.umd,
      name: pkg.umdName,
      banner,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
