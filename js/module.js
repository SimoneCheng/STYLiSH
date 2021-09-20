let token;

function getAjax(src, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
      document.querySelector('main').className = '';
    }
  };
  xhr.open('GET', src);
  document.querySelector('main').className = 'loading';
  xhr.send();
}

function postAjax(src, body, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
    }
  };
  xhr.open('POST', src);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(body);
}

function checkoutPostAjax(src, body, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
      document.querySelector('main').className = '';
    }
  };
  xhr.open('POST', src);
  xhr.setRequestHeader('Content-type', ' application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  document.querySelector('main').className = 'loading';
  xhr.send(body);
}

function login() {
  FB.login((response) => {
    if (response.status === 'connected') {
      const url = 'https://api.appworks-school.tw/api/1.0/user/signin';
      const body = JSON.stringify({
        provider: 'facebook',
        access_token: `${response.authResponse.accessToken}`,
      });
      postAjax(url, body, (data) => {
        token = data.data.access_token;
      });
      window.alert('登入成功！');
    } else {
      window.alert('登入失敗！');
    }
  }, { scope: 'public_profile,email' });
}

function checkLoginStatus() {
  FB.getLoginStatus((response) => {
    if (response.status === 'connected') {
      window.location.href = './profile.html';
    } else {
      login();
    }
  });
}

function memberFunction() {
  const memberBtn = document.getElementsByClassName('member');
  for (let i = 0; i < memberBtn.length; i++) {
    memberBtn[i].addEventListener('click', checkLoginStatus);
  }
}

function facebookSDK() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: '1039043410169686',
      cookie: true,
      xfbml: true,
      version: 'v11.0',
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        const url = 'https://api.appworks-school.tw/api/1.0/user/signin';
        const body = JSON.stringify({
          provider: 'facebook',
          access_token: `${response.authResponse.accessToken}`,
        });
        postAjax(url, body, (data) => { token = data.data.access_token; });
      }
    });
  };

  (function (d, s, id) {
    const fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    const js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

function renewCartIcon() {
  const count = document.getElementsByClassName('count');
  const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart')) || [];
  for (let i = 0; i < count.length; i++) {
    count[i].innerHTML = allProductsInCart.length;
  }
}

function search() {
  const keyword = window.location.search;
  if (keyword.split('=')[0] === '?keyword') {
    window.location.href = `./index.html${keyword}`;
  }
}

export {
  getAjax, postAjax, checkoutPostAjax, memberFunction, facebookSDK, renewCartIcon, search,
};
