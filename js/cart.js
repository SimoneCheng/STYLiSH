import { renewCartIcon } from './module.js';

const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart')) || [];
const storageLocal = window.localStorage;
const itemDiv = document.getElementById('items');
let parent;

/* =========================================================================
    render product from localstorage into to cart and calculate total price
   ========================================================================= */

function renderTitle() {
  const title = document.getElementById('title');
  const titleTxt = document.createTextNode(`購物車(${allProductsInCart.length})`);
  title.appendChild(titleTxt);
}

function renderMainImage(image, item) {
  const mainImg = document.createElement('img');
  mainImg.classList.add('item_image');
  mainImg.src = `${image}`;
  mainImg.alt = 'main_img';
  item.appendChild(mainImg);
}

function renderItemDetail(name, id, color, size, item) {
  const itemDetail = document.createElement('div');
  const itemName = document.createElement('div');
  const itemId = document.createElement('div');
  const itemColor = document.createElement('div');
  const itemSize = document.createElement('div');
  const itemNameTxt = document.createTextNode(`${name}`);
  const itemIdTxt = document.createTextNode(`${id}`);
  const itemColorTxt = document.createTextNode(`顏色｜${color}`);
  const itemSizeTxt = document.createTextNode(`尺寸｜${size}`);

  itemDetail.classList.add('item_detail');
  itemName.classList.add('item_name');
  itemId.classList.add('item_id');
  itemColor.classList.add('item_color');
  itemSize.classList.add('item_size');

  itemName.appendChild(itemNameTxt);
  itemId.appendChild(itemIdTxt);
  itemColor.appendChild(itemColorTxt);
  itemSize.appendChild(itemSizeTxt);

  itemDetail.appendChild(itemName);
  itemDetail.appendChild(itemId);
  itemDetail.appendChild(itemColor);
  itemDetail.appendChild(itemSize);

  item.appendChild(itemDetail);
}

function renderQuantity(totalStock, number, item) {
  const itemQty = document.createElement('div');
  const mobile = document.createElement('div');
  const mobileTxt = document.createTextNode('數量');
  const select = document.createElement('select');

  itemQty.classList.add('item_quantity');
  mobile.classList.add('mobile-text');
  select.classList.add('qtySelect');

  for (let i = 1; i <= totalStock; i++) {
    const optionNode = document.createElement('option');
    optionNode.setAttribute('value', `${i}`);
    optionNode.textContent = `${i}`;
    if (i === number) { optionNode.selected = true; }
    select.appendChild(optionNode);
  }

  mobile.appendChild(mobileTxt);
  itemQty.appendChild(mobile);
  itemQty.appendChild(select);
  item.appendChild(itemQty);
}

function renderPrice(price, item) {
  const itemPrice = document.createElement('div');
  const mobile = document.createElement('div');
  const itemPriceTxt = document.createTextNode(`NT.${price}`);
  const mobileTxt = document.createTextNode('單價');

  itemPrice.classList.add('item_price');
  mobile.classList.add('mobile-text');

  mobile.appendChild(mobileTxt);
  itemPrice.appendChild(mobile);
  itemPrice.appendChild(itemPriceTxt);
  item.appendChild(itemPrice);
}

function calculateSubtotal(number, price) {
  const calculateSubtotalResult = parseInt(number, 10) * parseInt(price, 10);
  return calculateSubtotalResult;
}

function calculateSummarySubtotal() {
  let subtotal = 0;
  const itemSubtotal = document.querySelectorAll('.item .item_subtotal');
  for (let i = 0; i < itemSubtotal.length; i++) {
    subtotal += parseInt(itemSubtotal[i].innerText.split('.')[1], 10);
  }
  return subtotal;
}

function calculateSummaryFreight(freightPrice) {
  let freight = freightPrice;
  if (allProductsInCart.length === 0) { freight = 0; } else {
    freight = freightPrice;
  }
  return freight;
}

function calculateSummaryTotal() {
  let total = 0;
  const subtotal = document.querySelector('#subtotal .value span').innerText;
  const freight = document.querySelector('.freight .value span').innerText;
  total = parseInt(subtotal, 10) + parseInt(freight, 10);
  return total;
}

function renderSubtotal(number, price, item) {
  const itemSubtotal = document.createElement('div');
  const mobile = document.createElement('div');
  const mobileTxt = document.createTextNode('小計');
  const itemSubtotalTxt = document.createTextNode(`NT.${calculateSubtotal(number, price)}`);

  itemSubtotal.classList.add('item_subtotal');
  mobile.classList.add('mobile-text');

  mobile.appendChild(mobileTxt);
  itemSubtotal.appendChild(mobile);
  itemSubtotal.appendChild(itemSubtotalTxt);
  item.appendChild(itemSubtotal);
}

function renderRemove(item) {
  const remove = document.createElement('div');
  const img = document.createElement('img');
  remove.classList.add('item_remove');
  img.src = './images/cart-remove.png';
  img.alt = 'remove_btn';
  remove.appendChild(img);
  item.appendChild(remove);
}

function summarySubtotal() {
  const value = document.querySelector('#subtotal .value');
  const span = document.createElement('span');
  const txt = document.createTextNode(`${calculateSummarySubtotal()}`);
  span.appendChild(txt);
  value.appendChild(span);
}

function summaryFreight() {
  const value = document.querySelector('.freight .value');
  const span = document.createElement('span');
  const txt = document.createTextNode(`${calculateSummaryFreight(60)}`);
  span.appendChild(txt);
  value.appendChild(span);
}

function summaryTotal() {
  const value = document.querySelector('#total .value');
  const span = document.createElement('span');
  const txt = document.createTextNode(`${calculateSummaryTotal()}`);
  span.appendChild(txt);
  value.appendChild(span);
}

function noProductInCart() {
  const items = document.getElementById('items');
  const item = document.createElement('div');
  const txt = document.createTextNode('購物車裡面沒有商品喔～');
  item.style.textAlign = 'center';
  item.classList.add('no-product');
  item.appendChild(txt);
  items.appendChild(item);
}

function updateSummary() {
  const summarySubtotalDiv = document.querySelector('#subtotal .value span');
  const summaryFreightDiv = document.querySelector('.freight .value span');
  const summaryTotalDiv = document.querySelector('#total .value span');
  summarySubtotalDiv.innerText = `${calculateSummarySubtotal()}`;
  summaryFreightDiv.innerText = `${calculateSummaryFreight(60)}`;
  summaryTotalDiv.innerText = `${calculateSummaryTotal()}`;
}

function renderAll() {
  renderTitle();
  const items = document.getElementById('items');
  if (allProductsInCart.length === 0) {
    noProductInCart();
  } else {
    allProductsInCart.forEach((e) => {
      const item = document.createElement('div');
      item.classList.add('item');
      renderMainImage(e.image, item);
      renderItemDetail(e.title, e.id, e.color, e.size, item);
      renderQuantity(e.totalStock, e.number, item);
      renderPrice(e.price, item);
      renderSubtotal(e.number, e.price, item);
      renderRemove(item);
      items.appendChild(item);
    });
  }
  summarySubtotal();
  summaryFreight();
  summaryTotal();
}

/* ===========================
    revise and delete product
   =========================== */

function modifyQty(e) {
  if (e.target.classList.contains('qtySelect')) {
    parent = e.target.parentElement.parentElement;
    const items = document.getElementsByClassName('item');
    const arr = [...items];
    const i = arr.indexOf(parent);
    const subtotalDiv = document.querySelectorAll('.item .item_subtotal');
    allProductsInCart[i].number = parseInt(e.target.value, 10);
    storageLocal.setItem('stylishCart', JSON.stringify(allProductsInCart));
    subtotalDiv[i].innerHTML = `<div class="mobile-text">小計</div>NT.${calculateSubtotal(allProductsInCart[i].number, allProductsInCart[i].price)}`;
    updateSummary();
  }
}

function removeItem(e) {
  if (
    e.target.classList.contains('item_remove')
    || e.target.parentElement.classList.contains('item_remove')
  ) {
    if (e.target.parentElement.classList.contains('item_remove')) {
      parent = e.target.parentElement.parentElement;
    } else {
      parent = e.target.parentElement;
    }
    const title = document.getElementById('title');
    const items = document.getElementsByClassName('item');
    const arr = [...items];
    const index = arr.indexOf(parent);
    allProductsInCart.splice(index, 1);
    storageLocal.setItem('stylishCart', JSON.stringify(allProductsInCart));
    itemDiv.removeChild(parent);
    renewCartIcon();
    title.innerText = `購物車(${allProductsInCart.length})`;
    if (allProductsInCart.length === 0) { noProductInCart(); }
    updateSummary();
    alert('已從購物車移除囉～');
  }
}

/* =======================
    load all into webpage
   ======================= */

renderAll();
itemDiv.addEventListener('click', removeItem);
itemDiv.addEventListener('change', modifyQty);
