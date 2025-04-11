import roundSize from '../src/roundSize';

test('roundSize', () => {
  expect(roundSize(0)).toBe(32);
  expect(roundSize(1)).toBe(32);
  expect(roundSize(31)).toBe(32);
  expect(roundSize(32)).toBe(32);
  expect(roundSize(33)).toBe(64);
  expect(roundSize(64)).toBe(64);
  expect(roundSize(100000)).toBe(100000);
  expect(roundSize(100001)).toBe(100032);
  expect(roundSize(30, 32, 31)).toBe(31);
  expect(roundSize(30, 32)).toBe(32);
  expect(roundSize(30, 10)).toBe(30);
  expect(roundSize(35, 10)).toBe(40);
});
