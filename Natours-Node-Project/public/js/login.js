/* eslint-disable */

import axios from 'axios';
import { showAlerts } from './alerts';

// console.log(axios);

// LOGGIN
// admin@natours.io
export const loginHandler = async (email, password) => {
  console.log(email, password);
  // alert(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      // url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlerts('success', 'Logged in Successfully');
      window.setTimeout(() => location.assign('/'), 1500);
    }
    // console.log(res);
  } catch (err) {
    // console.log(err.response.data.message);
    showAlerts('error', err.response.data.message);
  }
};

// document.querySelector('.form').addEventListener('submit', loginHandler);

//LOGGOUT
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlerts('success', 'Logged out Successfully');
      location.reload(true);
    }
  } catch (err) {
    showAlerts('error', 'Error logging out! Try again');
  }
};
