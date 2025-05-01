const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingsController');

const views = express.Router();

// pug checking base file rendering or not
// app.get('/', (req, res) => {
//   res.status(200).render('base');
// });
// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tourName: 'Zingle Bell',
//     user: 'Aliya',
//   });
// });

// views.use(authController.loginProtect);

// views.route('/tour/:tour').get(viewsController.getSingleTour);
// views
//   .route('/tour/:tour')
//   .get(authController.protect, viewsController.getSingleTour);

//in above auth protect no need after loginprotect setup we create new middwre for that

views.use(viewsController.alerts);
views
  .route('/')
  .get(

    authController.loginProtect,
    viewsController.getAllTours,
  );

views
  .route('/tour/:tour')
  .get(authController.loginProtect, viewsController.getSingleTour);
views.route('/login').get(authController.loginProtect, viewsController.login);
views.route('/me').get(authController.protect, viewsController.accountFun);
// views
//   .route('/my-bookings')
//   .get(authController.protect,  bookingController.bookingCheckout, viewsController.getMyBookings);
views
  .route('/my-bookings')
  .get(authController.protect, viewsController.getMyBookings);

// views.route('/submit-user-data').post(viewsController.updateUserData);

module.exports = views;
