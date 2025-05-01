const express = require('express');
const bookingsController = require('../controllers/bookingsController');

const authController = require('../controllers/authController');

const bookings = express.Router();

// bookings
//   .route('/checkout-booking/:tourid')
//   .get(authController.protect, bookingsController.getCheckout);

// bookings.use(
//   authController.protect,
//   authController.restrictTo('admin', 'lead-guide'),
// );

// bookings
//   .route('/')
//   .get(bookingsController.getAllBookings)
//   .post(bookingsController.createBooking);

// bookings
//   .route('/:id')
//   .get(bookingsController.getSingleBooking)
//   .patch(bookingsController.updateBooking)
//   .delete(bookingsController.deleteBooking);

// or  also like thise u can write without repating authc.protect in each route

bookings.use(authController.protect);

bookings.route('/checkout-booking/:tourid').get(bookingsController.getCheckout);

bookings.use(authController.restrictTo('admin', 'lead-guide'));

bookings
  .route('/')
  .get(bookingsController.getAllBookings)
  .post(bookingsController.createBooking);

bookings
  .route('/:id')
  .get(bookingsController.getSingleBooking)
  .patch(bookingsController.updateBooking)
  .delete(bookingsController.deleteBooking);

module.exports = bookings;
