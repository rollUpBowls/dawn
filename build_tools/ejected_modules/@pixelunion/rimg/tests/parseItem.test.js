import parseItem from '../src/parseItem.js';
import imgNodes from './test_data/parseItemData.js';

describe.each(imgNodes)('Test parseItem function', (data) => {
  test(`${data.name}`, () => {
    expect(parseItem(data.node, data.options))
      .toEqual(data.result);
  })
});

