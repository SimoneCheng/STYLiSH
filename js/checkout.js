import {
  checkoutPostAjax, memberFunction, facebookSDK, renewCartIcon, search,
} from './module.js';

// TapPay SDK Setup
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');

const fields = {
  number: {
    // css selector
    element: '#card-number',
    placeholder: '**** **** **** ****',
  },
  expirationDate: {
    // DOM object
    element: document.getElementById('card-expiration-date'),
    placeholder: 'MM / YY',
  },
  ccv: {
    element: '#card-ccv',
    placeholder: '後三碼',
  },
};

TPDirect.card.setup({
  fields,
  styles: {
    // Style all elements
    input: {
      color: 'gray',
    },
    // style valid state
    '.valid': {
      color: 'green',
    },
    // style invalid state
    '.invalid': {
      color: 'red',
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange',
      },
    },
  },
});

function checkLogin() {
  let isChecked = true;
  FB.getLoginStatus((response) => {
    if (response.status !== 'connected') {
      alert('尚未登入會員！無法結帳喔！');
      isChecked = false;
    } else { isChecked = true; }
  });
  return isChecked;
}

function checkForm() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const emailRule = /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;
  const phoneRule = /^09\d{8}$/;
  const cart = JSON.parse(localStorage.getItem('stylishCart')) || [];
  if (cart.length === 0) {
    alert('購物車空空的耶～');
    return false;
  }
  if (name === '') {
    alert('請記得填寫收件人姓名！');
    return false;
  }
  if (email === '') {
    alert('請記得填寫Email！');
    return false;
  }
  if (phone === '') {
    alert('請記得填寫手機號碼！');
    return false;
  }
  if (address === '') {
    alert('請記得填寫收件地址！');
    return false;
  }
  if (email !== '' && emailRule.test(email) !== true) {
    alert('Email格式錯誤，請重新填寫！');
    return false;
  }
  if (phone !== '' && phoneRule.test(phone) !== true) {
    alert('手機號碼填寫錯誤，請重新填寫！');
    return false;
  }
  return true;
}

function checkCard() {
  const checkCredit = TPDirect.card.getTappayFieldsStatus();
  if (checkCredit.status.number === 2) {
    alert('信用卡號碼有誤，請再確認！');
    return false;
  }
  if (checkCredit.status.expiry === 2) {
    alert('有效期限有誤，請再確認！');
    return false;
  }
  if (checkCredit.status.ccv === 2) {
    alert('安全碼有誤，請再確認！');
    return false;
  }
  return true;
}

function getList() {
  const cart = JSON.parse(localStorage.getItem('stylishCart'));
  const items = cart.map((item) => {
    const newItem = {
      id: item.id,
      name: item.title,
      price: item.price,
      color: {
        name: item.color,
        code: item.colorcode,
      },
      size: item.size,
      qty: item.number,
    };
    return newItem;
  });
  return items;
}

function orderData(prime) {
  const subtotal = document.querySelector('#subtotal .value span').innerText;
  const freight = document.querySelector('.freight .value span').innerText;
  const total = document.querySelector('#total .value span').innerText;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const time = document.querySelector('input[name="time"]:checked').value;
  const order = {
    prime,
    order: {
      shipping: 'delivery',
      payment: 'credit_card',
      subtotal: parseInt(`${subtotal}`, 10),
      freight: parseInt(`${freight}`, 10),
      total: parseInt(`${total}`, 10),
      recipient: {
        name: `${name}`,
        phone: `${phone}`,
        email: `${email}`,
        address: `${address}`,
        time: `${time}`,
      },
      list: getList(),
    },
  };
  return order;
}

function getPrime() {
  TPDirect.card.getPrime((result) => {
    if (result.status === 0) {
      const { prime } = result.card;
      const body = JSON.stringify(orderData(prime));
      checkoutPostAjax('https://api.appworks-school.tw/api/1.0/order/checkout', body, (data) => { window.location = `./thankYou.html?number=${data.data.number}`; });
      localStorage.removeItem('stylishCart');
    }
  });
}

// Load All Into Page
window.onload = function () {
  facebookSDK();
  memberFunction();
  renewCartIcon();
  search();
  const checkout = document.getElementById('checkout');
  checkout.addEventListener('click', () => {
    if (checkLogin() === false) { return; }
    if (checkForm() === false) { return; }
    if (checkCard() === false) { return; }
    getPrime();
  });
};
