import {
  search, renewCartIcon, facebookSDK, memberFunction,
} from './module.js';

const numberDiv = document.getElementById('number');
const number = window.location.search.split('=')[1];
numberDiv.innerText = `${number}`;
facebookSDK();
memberFunction();
search();
renewCartIcon();
