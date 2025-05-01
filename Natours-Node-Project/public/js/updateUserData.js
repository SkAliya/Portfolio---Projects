/* eslint-disable */

import axios from 'axios';
import { showAlerts } from './alerts';

// console.log(axios);

// // UPDATING USER DATA NOT PASSWORD
// export const updateUser = async (email, name) => {
//   console.log(email, name);

//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/updatedata',
//       data: {
//         email,
//         name,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlerts('success', 'Successfully Data Updated');
//     }
//     // console.log(res);
//   } catch (err) {
//     showAlerts('error', err.response.data.message);
//   }
// };

// UPDATING USER DATA & BOTH PASSWORD
export const updateDataPassword = async (data, type) => {
  // console.log(data, type);
  const url =
    type === 'password'
      ? '/api/v1/users/updatepassword'
      : '/api/v1/users/updatedata';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    if (res.data.status === 'success') {
      showAlerts('success', `Successfully ${type} Updated`);
    }
    // console.log(res);
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};
