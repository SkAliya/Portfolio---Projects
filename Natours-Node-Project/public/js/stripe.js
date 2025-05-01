/* eslint-disable */
import axios from 'axios';
import { showAlerts } from './alerts';

const stripe = Stripe(
  'pk_test_51RH2dWFNpUqZdW5e1Mj0wTk8qDBm0sITDu37KnwQMzMAnIHxtA7jTHKsMivU6EKvxTxbH11nsnmoogvPxovfurCx004f4RwHnz',
);

export const bookTour = async (tourId) => {
  try {
    console.log('tourid is :---------', tourId);
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-booking/${tourId}`);
    console.log(session);

    //  2) Create checout form + charge the card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // if (res.status === 200) location.assign(res.data.data.url);
  } catch (err) {
    console.log(err);
    showAlerts('error', err.response.data.message);
  }
};
