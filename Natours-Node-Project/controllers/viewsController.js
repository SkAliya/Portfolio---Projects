const catchAsync = require('../utils/catchAsync');
const AppGlobalErrorClass = require('../utils/appGlobalError');
const Tour = require('../models/toursModel');
const Booking = require('../models/bookingsModel');



exports.alerts= (req,res,next)=>{
  const {alert} = req.query;
  if(alert === "booking"){ 
    res.locals.alert = "Your booking was successfull, Please check your email for confirmation. If your booking doesn't showup here  immediatley, please come back later.";
  }
  next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
  // 1) GET DATA FOR REQUESTE
  const tours = await Tour.find();

  if (!tours) next(new AppGlobalErrorClass(400, 'No tours found'));
  // 2) BUILD TEMPLATE

  // 3) RENDER TEMPLATE USING DATA FROM 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getSingleTour = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  // my exprmt
  // const urlTourName = req.params.tour.split('-').join(' ');
  // const tour = await Tour.find().byName(urlTourName);
  // 1) GET DATA FOR REQUESTE TOUR WITH REVIEWS & GUIDES

  const tour = await Tour.findOne({ slug: req.params.tour }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // console.log(tour);

  if (!tour) next(new AppGlobalErrorClass(400, 'No tour found with that name'));
  // 2) BUILD TEMPLATE

  // 3) RENDER TEMPLATE USING DATA FROM 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.accountFun = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
});

// another way of form submitting dircelty on form elemetn action
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   // console.log('User data:', req.body.email, req.body.name);
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       email: req.body.email,
//       name: req.body.name,
//     },
//     { new: true, runValidators: true },
//   );

//   res.status(200).render('account', {
//     title: 'Your Account',
//     user: updatedUser,
//   });
// });

// GETTING MY ALL BOOKINGS WHICH USER BOOKED

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // 1) Get all bookings with matched user id of current logged user
  const bookings = await Booking.find({ user: req.user.id });
  // console.log(bookings.user);

  // 2) find Alll tours with bookings contains tours id matching
  // each bookings have 1 tour id 1 user id
  const tourids = bookings.map((b) => b.tour[0]);
  const tours = await Tour.find({ _id: { $in: tourids } });

  // console.log(tours, tourids, bookings);

  res.status(200).render('overview', {
    title: 'My-Bookings',
    tours,
  });
});
