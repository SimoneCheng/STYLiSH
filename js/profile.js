import { postAjax, renewCartIcon, search } from './module.js';

function logout() {
  FB.logout();
  alert('成功登出惹！下次再會！');
  window.location.href = './index.html';
}

function render(data) {
  const userInfo = data.data.user;
  const member = document.getElementById('member');
  const img = document.createElement('img');
  const memberDetail = document.createElement('div');
  const name = document.createElement('h3');
  const email = document.createElement('h3');
  const logOut = document.createElement('button');
  const nameTxt = document.createTextNode(`${userInfo.name}`);
  const emailTxt = document.createTextNode(`${userInfo.email}`);
  const logOutTxt = document.createTextNode('登出');
  memberDetail.classList.add('member_detail');
  img.src = `${userInfo.picture}`;
  img.alt = 'user_img';
  name.appendChild(nameTxt);
  email.appendChild(emailTxt);
  logOut.appendChild(logOutTxt);
  memberDetail.appendChild(name);
  memberDetail.appendChild(email);
  memberDetail.appendChild(logOut);
  member.appendChild(img);
  member.appendChild(memberDetail);
  logOut.addEventListener('click', logout);
}

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    const url = 'https://api.appworks-school.tw/api/1.0/user/signin';
    const body = JSON.stringify({
      provider: 'facebook',
      access_token: `${response.authResponse.accessToken}`,
    });
    postAjax(url, body, (data) => render(data));
  } else {
    window.location.href = './index.html';
  }
}

// Facebook SDK
window.fbAsyncInit = function () {
  FB.init({
    appId: '1039043410169686',
    cookie: true,
    xfbml: true,
    version: 'v11.0',
  });

  FB.AppEvents.logPageView();

  FB.getLoginStatus((response) => {
    statusChangeCallback(response);
  });
};

(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  const js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// load all into page
window.onload = function () {
  renewCartIcon();
  search();
  const memberBtn = document.getElementsByClassName('member');
  for (let i = 0; i < memberBtn.length; i++) {
    memberBtn[i].addEventListener('click', () => { window.location.href = './profile.html'; });
  }
};
