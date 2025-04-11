function createNode(img, isImg = true) {
  const doc = new DOMParser().parseFromString(img, 'text/html');
  if (isImg) {
    return doc.querySelector('img');
  } else {
    return doc.querySelector('div');
  }
}

const templateRender = () => {};

const imgAllAttributes = createNode(
  `<img
  src="test/image_{size}.jpg"
  data-rimg="loaded"
  data-rimg-scale="1"
  data-rimg-template="test/image_{size}.jpg"
  data-rimg-max="4096x2731"
  data-rimg-crop="center"
  data-rimg-placeholder="1350x1350"
  srcset="test/image_{size}.jpg"
  width="660"
  height="380"
  >`
);

const imgNoAttributes = createNode(
  `<img
  src="test/image_{size}.jpg"
  srcset="test/image_{size}.jpg"
  width="660"
  height="380"
  >`
);

const divWithAttributes = createNode(
  `<div
  data-rimg="loaded"
  data-rimg-scale="1"
  data-rimg-template="test/image_{size}.jpg"
  data-rimg-max="4096x2731"
  data-rimg-crop="center"
  data-rimg-placeholder="1350x1350"
  style="width:660px;height:380px;background-image:url(test/image_{size}.jpg);"
  ></div>`, false
);

const divNoAttributes = createNode(
  `<div
  style="width:660px;height:380px;background-image:url(test/image_{size}.jpg);"
  ></div>`, false
);

const imgNodes = [
  {
    name: 'IMG node with all rimg attributes',
    node: imgAllAttributes,
    options: {
      templateRender: templateRender
    },
    result: {
      el: imgAllAttributes,
      isImage: true,
      isBackgroundImage: false,
      scale: 1,
      density: 1,
      template: 'test/image_{size}.jpg',
      templateRender: templateRender,
      max: { width: 4096, height: 2731 },
      round: 32,
      placeholder: { width: 1350, height: 1350 },
      crop: 'center'
    }
  },
  {
    name: 'IMG node without rimg attributes',
    node: imgNoAttributes,
    options: {
      templateRender: templateRender
    },
    result: {
      el: imgNoAttributes,
      isImage: false,
      isBackgroundImage: false,
      scale: 1,
      density: 1,
      template: false,
      templateRender: templateRender,
      max: { width: Infinity, height: Infinity },
      round: 32,
      placeholder: false,
      crop: null
    }
  },
  {
    name: 'DIV node with all rimg attributes',
    node: divWithAttributes,
    options: {
      templateRender: templateRender
    },
    result: {
      el: divWithAttributes,
      isImage: true,
      isBackgroundImage: true,
      scale: 1,
      density: 1,
      template: 'test/image_{size}.jpg',
      templateRender: templateRender,
      max: { width: 4096, height: 2731 },
      round: 32,
      placeholder: { width: 1350, height: 1350 },
      crop: 'center'
    }
  },
  {
    name: 'DIV node without rimg attributes',
    node: divNoAttributes,
    options: {
      templateRender: templateRender
    },
    result: {
      el: divNoAttributes,
      isImage: false,
      isBackgroundImage: false,
      scale: 1,
      density: 1,
      template: false,
      templateRender: templateRender,
      max: { width: Infinity, height: Infinity },
      round: 32,
      placeholder: false,
      crop: null
    }
  },
]

export default imgNodes;
