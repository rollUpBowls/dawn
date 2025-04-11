var fs = require('fs');
var uglify = require('uglify-js');

module.exports = function(inputPath, outputPath) {
  var code = fs.readFileSync(inputPath, 'utf8');

  var result = uglify.minify(code, {
    compress: {
      unsafe: true
    },
    output: {
      comments: /^!/
    }
  });

  fs.writeFileSync(outputPath, result.code);
};
