import {
  getAjax, memberFunction, facebookSDK, renewCartIcon,
} from './module.js';

// 宣告全域變數
const url = 'https://api.appworks-school.tw/api/1.0/products/';
const campaign = document.getElementById('campaigns');
const campaignImg = document.getElementsByClassName('campaign');
const dot = document.getElementsByClassName('dot');
const divContainer = document.getElementById('products');
const keyword = window.location.search;
let category = '';
let paging = 0;
let slideIndex = 0;
let timer;

/* ==================
    product list API
   ================== */

function renderImg(mainImage, a) {
  const img = document.createElement('img');
  img.src = mainImage;
  img.alt = 'product';
  a.appendChild(img);
}

function renderColor(colors, a) {
  const productColors = document.createElement('div');
  productColors.classList.add('product_colors');
  colors.forEach((e) => {
    const productColor = document.createElement('div');
    productColor.classList.add('product_color');
    productColor.style.backgroundColor = `#${e.code}`;
    productColors.appendChild(productColor);
  });
  a.appendChild(productColors);
}

function renderTitle(title, a) {
  const productTitle = document.createElement('div');
  const titleTxt = document.createTextNode(title);
  productTitle.classList.add('product_title');
  productTitle.appendChild(titleTxt);
  a.appendChild(productTitle);
}

function renderPrice(price, a) {
  const productPrice = document.createElement('div');
  const priceTxt = document.createTextNode(`TWD.${price}`);
  productPrice.classList.add('product_price');
  productPrice.appendChild(priceTxt);
  a.appendChild(productPrice);
}

function render(data) {
  paging = data.next_paging;
  if (data.data.length === 0) {
    const notFound = document.getElementById('not_found');
    divContainer.style.display = 'none';
    notFound.style.display = 'block';
  } else {
    data.data.forEach((e) => {
      const a = document.createElement('a');
      a.classList.add('product');
      a.href = `./product.html?id=${e.id}`;
      renderImg(e.main_image, a);
      renderColor(e.colors, a);
      renderTitle(e.title, a);
      renderPrice(e.price, a);
      divContainer.appendChild(a);
    });
  }
}

/* ==================
    Infinite Scroll
   ================== */

function LoadMoreData() {
  const footer = document.querySelector('footer');
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight + (footer.getBoundingClientRect().height) / 2 >= scrollHeight) {
    const more = `${url}${category}?paging=${paging}`;
    if (paging === undefined) {
      return;
    }
    getAjax(more, render);
  }
}

// 降低 scroll event 被觸發的次數
window.addEventListener('scroll', () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(LoadMoreData, 150);
});

/* ==================
    product search API
   ================== */

if (keyword.split('=')[0] === '?keyword') {
  getAjax(`${url}search${keyword}`, render);
}

/* ========================
    Marketing Campaign API
   ======================== */

// campaign 圖片手動輪播
function campaignDotBtn(index) {
  const currentDot = document.getElementsByClassName('dot--active');
  const currentCampaign = document.getElementsByClassName('campaign--active');
  currentDot[0].className = currentDot[0].className.replace(' dot--active', '');
  currentCampaign[0].className = currentCampaign[0].className.replace(' campaign--active', '');
  dot[index].classList.add('dot--active');
  campaignImg[index].classList.add('campaign--active');
  slideIndex = index;
}

// campaign 圖片自動輪播
function campaignAnimation() {
  const campaignLength = campaignImg.length;
  const lastIndexOfCampaign = campaignLength - 1;
  const firstIndexOfCampaign = 0;
  const nextIndexOfCampaign = slideIndex + 1;
  campaignImg[slideIndex].classList.remove('campaign--active');
  dot[slideIndex].classList.remove('dot--active');
  if (slideIndex >= lastIndexOfCampaign) {
    campaignImg[firstIndexOfCampaign].classList.add('campaign--active');
    dot[firstIndexOfCampaign].classList.add('dot--active');
    slideIndex = firstIndexOfCampaign;
  } else {
    campaignImg[nextIndexOfCampaign].classList.add('campaign--active');
    dot[nextIndexOfCampaign].classList.add('dot--active');
    slideIndex = nextIndexOfCampaign;
  }
}

// 滑鼠是否進入區塊 → 控制自動輪播停止與啟動
const changeTime = 5000;
let campaignAnimationControl = setInterval(campaignAnimation, changeTime);
campaign.onmouseenter = function () { clearInterval(campaignAnimationControl); };
campaign.onmouseleave = function () {
  campaignAnimationControl = setInterval(campaignAnimation, changeTime);
};

function renderCampaignAndDots(data) {
  // render campaign
  data.data.forEach((e) => {
    const a = document.createElement('a');
    const campaignStory = document.createElement('div');
    const campaignTxt = document.createTextNode(`${e.story}`);
    campaignStory.classList.add('campaign_story');
    campaignStory.appendChild(campaignTxt);
    a.classList.add('campaign');
    a.style.backgroundImage = `url(${e.picture})`;
    a.href = `./product.html?id=${e.product_id}`;
    a.appendChild(campaignStory);
    campaign.appendChild(a);
  });
  // render dots
  const dots = document.createElement('div');
  dots.classList.add('dots');
  for (let i = 0; i < data.data.length; i++) {
    const dotDiv = document.createElement('div');
    dotDiv.classList.add('dot');
    dots.appendChild(dotDiv);
  }
  campaign.appendChild(dots);
  // 先把第一張圖和第一個點點放進動畫初始頁面
  campaignImg[0].classList.add('campaign--active');
  dot[0].classList.add('dot--active');
  // 啟動按點點的手動輪播的功能
  for (let i = 0; i < dot.length; i++) {
    dot[i].addEventListener('click', () => { campaignDotBtn(i); });
  }
}

/* ======================
    load all into webpage
   ====================== */

window.onload = function () {
  facebookSDK();
  memberFunction();
  renewCartIcon();
  getAjax('https://api.appworks-school.tw/api/1.0/marketing/campaigns', renderCampaignAndDots);
  switch (keyword) {
    case '':
      category = 'all';
      getAjax(`${url}${category}`, render);
      break;
    case '?tag=women':
      category = 'women';
      getAjax(`${url}${category}`, render);
      break;
    case '?tag=men':
      category = 'men';
      getAjax(`${url}${category}`, render);
      break;
    case '?tag=accessories':
      category = 'accessories';
      getAjax(`${url}${category}`, render);
      break;
    default:
      break;
  }
};
