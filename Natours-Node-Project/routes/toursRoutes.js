const express = require('express');
const toursControllers = require('./../controllers/toursControllers');
const authController = require('./../controllers/authController');

const reviewsRouter = require('./reviewsRoutes');

const tour = express.Router();

// Nested  routes using express
tour.use('/:tourid/reviews', reviewsRouter);

tour
  .route('/top-5-cheap-tours')
  .get(toursControllers.getCheapToursMiddleware, toursControllers.getReq);

tour.route('/tours-stats').get(toursControllers.toursStats);
tour
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    toursControllers.monthlyTours,
  );

tour
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursControllers.getToursWithin);
// api/v1/tours/tours-within?distance=200&center=1.11234,0.896242&unit=mi  (mi/km) upontil this point we built like thia url rember
// new way nd most coomn widly used way is like below
// api/v1/tours/tours-within/distance/200/center/1.00223,0.5552/unnit/mi

tour.route('/distances/:latlng/unit/:unit').get(toursControllers.getDistances);

tour
  .route('/')
  .get(toursControllers.getReq)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursControllers.postReq,
  );

tour
  .route('/:id')
  .get(toursControllers.getSingleReq)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursControllers.uploadTourImages,
    toursControllers.resizeTourImages,
    toursControllers.patchReq,
  )

  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursControllers.deleteReq,
  );

module.exports = tour;
