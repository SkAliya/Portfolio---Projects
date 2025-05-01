const express = require('express');
const reviewsController = require('./../controllers/reviewsController');
const authController = require('./../controllers/authController');

// const review = express.Router();

const review = express.Router({ mergeParams: true }); //we added this params for nested routes grab the parents data like tour id in searchparams in query no way of knoing only this way the reviews router grab params of parent route params becasue tour nd reviews r nested /tours/:touid/reviews

// GETTING REVIEWS & CREATING NEW

review.use(authController.protect);

review
  .route('/')
  .get(reviewsController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewsController.setReqBodyWithTourIds,
    reviewsController.createReview,
  );

// review
//   .delete('/:id', reviewsController.deleteReview)
//   .patch('/:id', reviewsController.updateReview);

review
  .route('/:id')
  .get(reviewsController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewsController.deleteReview,
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewsController.updateReview,
  );

module.exports = review;
