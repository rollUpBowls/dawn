import supportedDensity from '../src/supportedDensity.js';

const item = {
  max: { height: 2500, width: 2500 },
  density: 2
};

describe('supportedDensity should return a valid density value', () => {
  test('Size is less than max size', () => {
    // actual size
    const size = {
      height: 10,
      width: 10
    };

    expect(supportedDensity(item, size)).toEqual('2.00');
  });

  test('Size is equal to max size', () => {
    // actual size
    const size = {
      height: 2500,
      width: 2500
    };

    expect(supportedDensity(item, size)).toEqual('1.00');
  });

  test('Size is greater than max size', () => {
    // actual size
    const size = {
      height: 3000,
      width: 3000
    };

    expect(supportedDensity(item, size)).toEqual('1.00');
  });

  test('Size is zero', () => {
    // actual size
    const size = {
      height: 0,
      width: 0
    };

    expect(supportedDensity(item, size)).toEqual('2.00');
  });
});
