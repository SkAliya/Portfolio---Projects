/* eslint-disable */

import 'core-js';
import 'regenerator-runtime/runtime';
import { loginHandler, logout } from './login.js';
import { mapDisplayFun } from './leaflet.js';
import { showAlerts } from './alerts';
// import { updateUser } from './updateUserData.js';
import { updateDataPassword } from './updateUserData.js';
import { bookTour } from './stripe.js';
// import { updateUserData } from './updateUserData.js';

// console.log('Im from index');

//  LOGIN CODE
const formele = document.querySelector('.form--login');
if (formele) {
  formele.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginHandler(email, password);
  });
}

// MAP CODE
const mapEle = document.getElementById('map');

if (mapEle) {
  const locations = JSON.parse(mapEle.dataset.locations);
  mapDisplayFun(locations);
}

console.log('hiiiiiiiiiiiiiiiiiiiiiiiiiiii');

// LOGOUT CODE
const logoutBtnEle = document.querySelector('.nav__el--logout');

if (logoutBtnEle) logoutBtnEle.addEventListener('click', logout);

// UPDATING USER DATA FORM SUBMITTING
// const formupdateuser = document.querySelector('.form-user-data');
// formupdateuser.addEventListener('submit', (e) => {
//   e.preventDefault();
//   // showAlerts('success', 'Successfully updated');
//   const email = document.getElementById('email').value;
//   const name = document.getElementById('name').value;
//   // updateUserData(email, name);
//   updateUser(email, name);
// });

// UPDATING USER DATA & PASSWORD
const formupdateuser = document.querySelector('.form-user-data');
const formupdatepassowrd = document.querySelector('.form-user-settings');

// ----------email,name
if (formupdateuser) {
  formupdateuser.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateDataPassword(form, 'data');
  });
}

// ------------password

if (formupdatepassowrd) {
  formupdatepassowrd.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'Saving....';
    const oldpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordconfirm = document.getElementById('password-confirm').value;

    updateDataPassword({ oldpassword, password, passwordconfirm }, 'password');

    document.querySelector('.btn-save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// BOOK TOUR WITH STRIPE

const btnBook = document.getElementById('book-tour');
if (btnBook) {
  btnBook.addEventListener('click', (e) => {
    console.log(e.target);
    e.target.textContent = 'Processing....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}


const alertmessage = document.querySelector('body').dataset.alert;
console.log(alertmessage);
if (alertmessage) showAlerts('success', alertmessage, 20);