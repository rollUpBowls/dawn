// This is all copied from Liquid.js and slightly reformatted to work with Node.

const toStr = Object.prototype.toString;

/*
 * Checks if value is classified as a String primitive or object.
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is a string, else false.
 */
function isString(value) {
  return toStr.call(value) === '[object String]';
}

function isNil(value) {
  return value === null || value === undefined;
}

/*
 * Checks if value is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is an object, else false.
 */
function isObject(value) {
  const type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
}

function stringify(value) {
  if (isNil(value)) {
    return String(value);
  }
  if (typeof value.to_liquid === 'function') {
    return stringify(value.to_liquid());
  }
  if (typeof value.toLiquid === 'function') {
    return stringify(value.toLiquid());
  }
  if (isString(value) || value instanceof RegExp || value instanceof Date) {
    return value.toString();
  }

  const cache = [];
  return JSON.stringify(value, (key, value) => {
    if (isObject(value)) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });
}

module.exports = stringify;
