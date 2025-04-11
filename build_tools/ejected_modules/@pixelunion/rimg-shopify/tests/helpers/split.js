const stringify = require('./stringify');

// Overwrites the standard split filter to handle some edge cases.
function split(v, arg) {
  const string = stringify(v);

  // If we try to split an empty string, ensure we return a 2 item array
  // so arr[1] == blank (like in standard Liquid) and rimg is happy
  // Purely a hack for our purposes.
  if (v === '') {
    return ['', ''];
  }

  // Handle special case in Ruby's .split method
  // If pattern is a single space, str is split on whitespace,
  // with leading whitespace and runs of contiguous whitespace characters ignored.
  // https://ruby-doc.org/core-2.4.0/String.html#method-i-split
  if (arg === ' ') {
    return string.trim().split(/ +/);
  }

  return string.split(arg);
}

module.exports = split;
