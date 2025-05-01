// const AppGlobalErrorClass = require('../utils/appGlobalError');
// const Tour = require('./../models/toursModel');
// const User = require('../models/userModel');
// const catchAsyc = require('./../utils/catchAsync');
const Review = require('../models/reviewsModel');
const handlerFactory = require('./handlerFactory');

// exports.getAllReviews = catchAsyc(async (req, res, next) => {
//   // const tour = await Tour.findById(req.params.id);
//   // if (!tour)
//   //   return next(new AppGlobalErrorClass(404, 'No tour found with that ID'));

//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     reviews: tour.reviews,
//   //   },
//   // });

//   // const reviews = await Review.find(); //only for reviews getting
//   let filter = {};
//   if (req.params.tourid) filter = { tour: req.params.tourid }; //if exits then filter ={id} if not {} means all reviews finds defult
//   // console.log(filter);
//   const reviews = await Review.find(filter); //getting all reviews related specific tour with id matched

//   res.status(200).json({
//     status: 'Success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.createReview = catchAsyc(async (req, res, next) => {
//   const newReview = await Review.create(req.body);

//   if (!newReview)
//     return next(new AppGlobalErrorClass(404, 'No review found with that ID'));

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       Reviews: newReview,
//     },
//   });
// });
// exports.createReview = catchAsyc(async (req, res, next) => {
//   if (!req.body.tourid) req.body.tour = req.params.tourid;
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   if (!newReview)
//     return next(new AppGlobalErrorClass(404, 'No review found with that ID'));

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       Reviews: newReview,
//     },
//   });
// });

exports.deleteReview = handlerFactory.deleteDoc(Review);
exports.updateReview = handlerFactory.updateDoc(Review);

exports.setReqBodyWithTourIds = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = handlerFactory.createDoc(Review);
exports.getAllReviews = handlerFactory.getAllDoc(Review);
exports.getReview = handlerFactory.getDoc(Review);
