const imgUrl = require('./helpers/imgUrl');

const image = {
  src: '//test.test/my_image.jpg',
};

test("| img_url: '500x500'", () => {
  expect(imgUrl(image, '500x500'))
    .toBe('//test.test/my_image_500x500.jpg?v=1234567890');
});

test("| img_url: '500x'", () => {
  expect(imgUrl(image, '500x'))
    .toBe('//test.test/my_image_500x.jpg?v=1234567890');
});

test("| img_url: 'x500'", () => {
  expect(imgUrl(image, 'x500'))
    .toBe('//test.test/my_image_x500.jpg?v=1234567890');
});

test("| img_url: '5000x500'", () => {
  expect(imgUrl(image, '5000x500'))
    .toBe('//test.test/my_image_5000x500.jpg?v=1234567890');
});

test("| img_url", () => {
  expect(imgUrl(image))
    .toBe('//test.test/my_image_small.jpg?v=1234567890');
});

test("| img_url: '500x500', crop: 'center'", () => {
  expect(imgUrl(image, '500x500', 'crop', 'center'))
    .toBe('//test.test/my_image_500x500_crop_center.jpg?v=1234567890');
});

test("| img_url: '500x500', crop: 'center', format: 'pjpg'", () => {
  expect(imgUrl(image, '500x500', 'crop', 'center', 'format', 'pjpg'))
    .toBe('//test.test/my_image_500x500_crop_center.progressive.jpg?v=1234567890');
});

test("| img_url: '500x500', crop: 'center', format: 'jpg'", () => {
  expect(imgUrl(image, '500x500', 'crop', 'center', 'format', 'jpg'))
    .toBe('//test.test/my_image_500x500_crop_center.jpg?v=1234567890');
});

test("| img_url: '500x500', crop: 'center', format: 'jpg', scale: 1", () => {
  expect(imgUrl(image, '500x500', 'crop', 'center', 'format', 'jpg', 'scale', 1))
    .toBe('//test.test/my_image_500x500_crop_center.jpg?v=1234567890');
});

test("| img_url: '500x500', crop: 'center', format: 'pjpg', scale: 2", () => {
  expect(imgUrl(image, '500x500', 'crop', 'center', 'format', 'pjpg', 'scale', 2))
    .toBe('//test.test/my_image_500x500_crop_center@2x.progressive.jpg?v=1234567890');
});

test("| img_url: '500x500', format: 'pjpg', crop: 'top', scale: 2", () => {
  expect(imgUrl(image, '500x500', 'format', 'pjpg', 'crop', 'top', 'scale', 2))
    .toBe('//test.test/my_image_500x500_crop_top@2x.progressive.jpg?v=1234567890');
});

test("| img_url: '500x500', scale: 2", () => {
  expect(imgUrl(image, '500x500', 'scale', 2))
    .toBe('//test.test/my_image_500x500@2x.jpg?v=1234567890');
});
