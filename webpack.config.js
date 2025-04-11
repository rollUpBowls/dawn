const path = require('path');
const entry = require('./entryPoints');

module.exports = {
  context: path.resolve(__dirname, './'),
  entry,
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: '[name]',
    sourceMapFilename: '[name].map',
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};
