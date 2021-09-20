import {
  getAjax, memberFunction, facebookSDK, renewCartIcon, search,
} from './module.js';

if (localStorage.getItem('stylishCart') == null) {
  localStorage.setItem('stylishCart', JSON.stringify([]));
}

const url = 'https://api.appworks-school.tw/api/1.0/products/details';
const ColorBtn = document.getElementsByClassName('product_color');
const ColorBtnSelected = document.getElementsByClassName('product_color--selected');
const outOfColor = document.getElementsByClassName('out_of_color');
const SizeBtn = document.getElementsByClassName('product_size');
const SizeBtnSelected = document.getElementsByClassName('product_size--selected');
const outOfSize = document.getElementsByClassName('out_of_size');
const addBtn = document.getElementById('increment');
const minusBtn = document.getElementById('decrement');
const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart'));
const addToCartBtn = document.getElementById('add-to-cart');
let num = document.getElementById('quantity').innerHTML;
let maxStock;
let productVariantData;
let productDetails;

/* ==============================
    Handle with Product Variants
   ============================== */

function cleanClassname(currentclassname, remove) {
  const currentName = currentclassname;
  if (currentclassname) {
    currentName.className = currentclassname.className.replace(remove, '');
  }
}

function defaultQuantity() {
  if (num > 1) {
    num = 1;
    document.getElementById('quantity').innerHTML = num;
  }
}

function haveStosk(aim, color, size) {
  return aim
    .filter((item) => item.color_code === color && item.size === size && item.stock !== 0)
    .map((item) => item.stock)[0];
}

function noStockSize(aim, color) {
  return aim
    .filter((item) => item.color_code === color && item.stock === 0)
    .map((item) => item.size);
}

function rgbToHex(hex) {
  const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;
  const color = rgba2hex(hex).toUpperCase().slice(1);
  return color;
}

function handleWithNoSize(color) {
  const noStockSizeArr = noStockSize(productVariantData, rgbToHex(color));
  for (let i = 0; i < SizeBtn.length; i++) {
    for (let j = 0; j < noStockSizeArr.length; j++) {
      if (SizeBtn[i].innerHTML === noStockSizeArr[j]) {
        SizeBtn[i].classList.add('out_of_size');
      }
    }
  }
}

function selectColor(index, target) {
  const targetColor = target.style.backgroundColor;
  const colorSelected = ColorBtnSelected[0].style.backgroundColor;
  const SizeSelected = SizeBtnSelected[0].innerHTML;
  if (ColorBtn[index].classList.contains('out_of_color')) { return; }
  if (colorSelected !== targetColor) { defaultQuantity(); }
  if (outOfSize) {
    for (let i = 0; i < outOfSize.length; i++) {
      cleanClassname(outOfSize[i], ' out_of_size');
    }
  }
  cleanClassname(ColorBtnSelected[0], ' product_color--selected');
  handleWithNoSize(targetColor);
  target.classList.add('product_color--selected');
  if (SizeBtnSelected[0].classList.contains('out_of_size')) {
    cleanClassname(outOfSize[0], ' product_size--selected');
    for (let i = 0; i < SizeBtn.length; i++) {
      maxStock = haveStosk(productVariantData, rgbToHex(targetColor), SizeBtn[i].innerHTML);
      if (maxStock !== undefined) {
        SizeBtn[i].classList.add('product_size--selected');
        break;
      }
    }
  }
  maxStock = haveStosk(productVariantData, rgbToHex(targetColor), SizeSelected);
}

function selectSize(index, target) {
  const targetSize = target.innerHTML;
  const sizeSelected = SizeBtnSelected[0].innerHTML;
  const colorSelected = ColorBtnSelected[0].style.backgroundColor;
  if (SizeBtn[index].classList.contains('out_of_size')) { return; }
  if (sizeSelected !== targetSize) { defaultQuantity(); }
  cleanClassname(SizeBtnSelected[0], ' product_size--selected');
  target.classList.add('product_size--selected');
  maxStock = haveStosk(productVariantData, rgbToHex(colorSelected), targetSize);
}

function selectQty() {
  addBtn.addEventListener('click', () => {
    if (num < maxStock) {
      num = parseInt(num, 10) + 1;
      document.getElementById('quantity').innerHTML = num;
    }
  });
  minusBtn.addEventListener('click', () => {
    if (num > 1) {
      num = parseInt(num, 10) - 1;
      document.getElementById('quantity').innerHTML = num;
    }
  });
}

/* ======================
    add products to cart
   ====================== */

function renewStockOnload() {
  allProductsInCart.forEach((e) => {
    if (e.id === productDetails.id) {
      productVariantData.forEach((n) => {
        if (e.colorcode === n.color_code && e.size === n.size) {
          const newStock = n;
          newStock.stock = parseInt(n.stock, 10) - parseInt(e.number, 10);
        }
      });
    }
  });
}

function renewStockAddToCartBtn(chosenProduct) {
  productVariantData.forEach((e) => {
    if (e.color_code === chosenProduct.colorcode && e.size === chosenProduct.size) {
      e.stock = parseInt(e.stock, 10) - parseInt(chosenProduct.number, 10);
    }
  });
}

function outOfAllProducts() {
  const stock0 = productVariantData.filter((item) => item.stock === 0);
  if (stock0.length === productVariantData.length) {
    for (let i = 0; i < ColorBtn.length; i++) {
      ColorBtn[i].classList.add('out_of_color');
    }
    for (let i = 0; i < SizeBtn.length; i++) {
      SizeBtn[i].classList.add('out_of_size');
    }
    addBtn.style.cursor = 'not-allowed';
    minusBtn.style.cursor = 'not-allowed';
    addToCartBtn.classList.add('disable');
    addToCartBtn.innerHTML = '已經賣完囉！';
  }
}

function productChosen() {
  const chosenProduct = {};
  const colorCodeSelected = ColorBtnSelected[0].style.backgroundColor;
  const colorSelected = () => productDetails.colors
    .filter((item) => item.code === chosenProduct.colorcode)
    .map((item) => item.name)[0];
  const sizeSelected = SizeBtnSelected[0].innerHTML;
  const totalStock = haveStosk(productDetails.variants, rgbToHex(colorCodeSelected), sizeSelected);
  chosenProduct.id = productDetails.id;
  chosenProduct.title = productDetails.title;
  chosenProduct.image = productDetails.main_image;
  chosenProduct.price = productDetails.price;
  chosenProduct.colorcode = rgbToHex(colorCodeSelected);
  chosenProduct.color = colorSelected();
  chosenProduct.size = SizeBtnSelected[0].innerHTML;
  chosenProduct.number = parseInt(num, 10);
  chosenProduct.totalStock = totalStock;
  return chosenProduct;
}

function checkIfChosenProdutIsInCart() {
  const chosenProduct = productChosen();
  const sameItem = allProductsInCart
    .filter((item) => item.id === chosenProduct.id
      && item.colorcode === chosenProduct.colorcode
      && item.size === chosenProduct.size);
  if (sameItem.length === 0) {
    allProductsInCart.push(chosenProduct);
    renewStockAddToCartBtn(chosenProduct);
    window.alert('成功加入購物車！');
    defaultQuantity();
  }
  if (sameItem.length !== 0) {
    allProductsInCart.forEach((e) => {
      if (e.id === chosenProduct.id
        && e.colorcode === chosenProduct.colorcode
        && e.size === chosenProduct.size) {
        e.number = parseInt(e.number, 10) + parseInt(chosenProduct.number, 10);
      }
    });
    renewStockAddToCartBtn(chosenProduct);
    window.alert('已更新購物車中的商品數量！');
    defaultQuantity();
  }
  maxStock -= parseInt(chosenProduct.number, 10);
}

function initProductVariantsSelected() {
  if (outOfColor.length === ColorBtn.length) { return; }
  // 載入頁面時，如果商品沒有完售，將完售的顏色標為不可選
  for (let i = 0; i < ColorBtn.length; i++) {
    const color = ColorBtn[i].style.backgroundColor;
    const noStock = noStockSize(productVariantData, rgbToHex(color));
    if (noStock.length === SizeBtn.length) {
      ColorBtn[i].classList.add('out_of_color');
    }
  }
  // 載入頁面時，如果商品沒有完售，預設第一個有庫存的顏色是被選到的
  for (let i = 0; i < ColorBtn.length; i++) {
    if (!ColorBtn[i].classList.contains('out_of_color')) {
      ColorBtn[i].classList.add('product_color--selected');
      break;
    }
  }
  handleWithNoSize(ColorBtnSelected[0].style.backgroundColor);
  // 載入頁面時，預設第一個有庫存的尺寸是被選到的
  for (let i = 0; i < SizeBtn.length; i++) {
    const color = ColorBtnSelected[0].style.backgroundColor;
    const size = SizeBtn[i].innerHTML;
    maxStock = haveStosk(productVariantData, rgbToHex(color), size);
    if (maxStock !== undefined) {
      SizeBtn[i].classList.add('product_size--selected');
      break;
    }
  }
}

function addToCart() {
  const colorSelected = ColorBtnSelected[0].style.backgroundColor;
  if (addToCartBtn.classList.contains('disable')) { return; }
  checkIfChosenProdutIsInCart();
  // 該顏色該尺寸被選購完後，預設第一個有庫存的size被選到
  if (maxStock === 0) {
    SizeBtnSelected[0].classList.add('out_of_size');
    cleanClassname(SizeBtnSelected[0], ' product_size--selected');
    for (let i = 0; i < SizeBtn.length; i++) {
      maxStock = haveStosk(productVariantData, rgbToHex(colorSelected), SizeBtn[i].innerHTML);
      if (maxStock > 0) {
        SizeBtn[i].classList.add('product_size--selected');
        break;
      }
    }
    defaultQuantity();
  }
  // 該顏色所有尺寸都沒庫存後，而且其他顏色還有庫存時
  if (outOfSize.length === SizeBtn.length
    && outOfColor.length < (ColorBtn.length) - 1) {
    ColorBtnSelected[0].classList.add('out_of_color');
    cleanClassname(ColorBtnSelected[0], ' product_color--selected');
    for (let i = 0; i < SizeBtn.length; i++) {
      cleanClassname(SizeBtn[i], ' out_of_size');
    }
    initProductVariantsSelected();
  }
  outOfAllProducts();
  localStorage.setItem('stylishCart', JSON.stringify(allProductsInCart));
  renewCartIcon();
}

/* =============================
    render data and ll function
   ============================= */

function renderMainImg(image) {
  const mainImg = document.createElement('img');
  const product = document.getElementById('product');
  mainImg.classList.add('product_main-image');
  mainImg.src = `${image}`;
  mainImg.alt = 'main_img';
  product.insertBefore(mainImg, product.children[0]);
}

function renderProductDetail1(title, id, price) {
  const productTitle = document.createElement('div');
  const productId = document.createElement('div');
  const productPrice = document.createElement('div');
  const productTitleTxt = document.createTextNode(`${title}`);
  const productIdTxt = document.createTextNode(`${id}`);
  const productPriceTxt = document.createTextNode(`TWD.${price}`);
  const productDetail = document.querySelector('.product_detail');
  productTitle.classList.add('product_title');
  productId.classList.add('product_id');
  productPrice.classList.add('product_price');
  productTitle.appendChild(productTitleTxt);
  productId.appendChild(productIdTxt);
  productPrice.appendChild(productPriceTxt);
  productDetail.insertBefore(productTitle, productDetail.children[0]);
  productDetail.insertBefore(productId, productDetail.children[1]);
  productDetail.insertBefore(productPrice, productDetail.children[2]);
}

function renderColorAndSize(colors, sizes) {
  const productVariant = document.getElementsByClassName('product_variant');
  const productColors = document.createElement('div');
  const productSizes = document.createElement('div');
  productColors.id = 'colors';
  productColors.classList.add('product_colors');
  productSizes.id = 'sizes';
  productSizes.classList.add('product_sizes');
  colors.forEach((e) => {
    const productColor = document.createElement('div');
    productColor.classList.add('product_color');
    productColor.style.backgroundColor = `#${e.code}`;
    productColors.appendChild(productColor);
  });
  sizes.forEach((e) => {
    const productSize = document.createElement('div');
    const productSizeTxt = document.createTextNode(e);
    productSize.classList.add('product_size');
    productSize.appendChild(productSizeTxt);
    productSizes.appendChild(productSize);
  });
  productVariant[0].appendChild(productColors);
  productVariant[1].appendChild(productSizes);
}

function renderProductDetail2(note, texture, description, wash, place) {
  const productDetail = document.querySelector('.product_detail');
  const productNote = document.createElement('div');
  const productTexture = document.createElement('div');
  const productDescription = document.createElement('div');
  const productWash = document.createElement('div');
  const productPlace = document.createElement('div');
  const productNoteTxt = document.createTextNode(note);
  const productTextureTxt = document.createTextNode(texture);
  const productDescriptionTxt = document.createTextNode(description);
  const productWashTxt = document.createTextNode(wash);
  const productPlaceTxt = document.createTextNode(place);
  productNote.classList.add('product_note');
  productTexture.classList.add('product_texture');
  productDescription.classList.add('product_description');
  productWash.classList.add('product_wash');
  productPlace.classList.add('product_place');
  productNote.appendChild(productNoteTxt);
  productTexture.appendChild(productTextureTxt);
  productDescription.appendChild(productDescriptionTxt);
  productWash.appendChild(productWashTxt);
  productPlace.appendChild(productPlaceTxt);
  productDetail.appendChild(productNote);
  productDetail.appendChild(productTexture);
  productDetail.appendChild(productDescription);
  productDetail.appendChild(productWash);
  productDetail.appendChild(productPlace);
}

function renderMore(story, images) {
  const product = document.getElementById('product');
  const productStory = document.createElement('div');
  const productStoryTxt = document.createTextNode(story);
  productStory.classList.add('product_story');
  productStory.appendChild(productStoryTxt);
  product.appendChild(productStory);
  images.forEach((e) => {
    const img = document.createElement('img');
    img.classList.add('product_image');
    img.src = e;
    img.alt = 'more_img';
    product.appendChild(img);
  });
}

function render(data) {
  const {
    // eslint-disable-next-line camelcase
    main_image, title, id, price, colors, sizes,
  } = data.data;
  const {
    note, texture, description, wash, place, story, images,
  } = data.data;
  productDetails = data.data;
  productVariantData = data.data.variants;
  renderMainImg(main_image);
  renderProductDetail1(title, id, price);
  renderColorAndSize(colors, sizes);
  renderProductDetail2(note, texture, description, wash, place);
  renderMore(story, images);
  renewStockOnload();
  outOfAllProducts();
  initProductVariantsSelected();
  for (let i = 0; i < ColorBtn.length; i++) {
    ColorBtn[i].addEventListener('click', (e) => { selectColor(i, e.target); });
  }
  for (let i = 0; i < SizeBtn.length; i++) {
    SizeBtn[i].addEventListener('click', (e) => { selectSize(i, e.target); });
  }
  selectQty();
  addToCartBtn.addEventListener('click', addToCart);
}

/* =======================
    load all into webpage
   ======================= */

window.onload = function () {
  facebookSDK();
  memberFunction();
  renewCartIcon();
  search();
  const keyword = window.location.search;
  if (keyword.split('=')[0] === '?id') {
    getAjax(`${url}${keyword}`, render);
  }
};
