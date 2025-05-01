const AppGlobalErrorClass = require('../utils/appGlobalError');
const Tour = require('./../models/toursModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// MIDDLEWARE

exports.getCheapToursMiddleware = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// TOURS HANDLERS

// exports.getReq = catchAsync(async (req, res, next) => {
//   // BUILDING QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .fields()
//     .pagination();

//   // EXECUTING QUERY
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).send({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// exports.getSingleReq = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // const tour = await Tour.findById(req.params.id).populate('guides');

//   if (!tour) {
//     return next(new AppGlobalErrorClass(404, 'No tour found with that ID'));
//   }

//   res.status(200).send({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.postReq = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   if (!newTour) {
//     return next(new AppGlobalErrorClass(404, 'No tour found with that ID'));
//   }

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tours: newTour,
//     },
//   });
// });

// exports.patchReq = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppGlobalErrorClass(404, 'No tour found with that ID'));
//   }
//   res.status(200).send({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.deleteReq = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppGlobalErrorClass(404, 'No tour found with that ID'));
//   }
//   res.status(204).json({
//     status: 'success',
//     message: 'successfully deleted',
//     data: null,
//   });
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppGlobalErrorClass(400, 'Please upload only images'));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.deleteReq = handlerFactory.deleteDoc(Tour);
exports.patchReq = handlerFactory.updateDoc(Tour);
exports.postReq = handlerFactory.createDoc(Tour);
exports.getReq = handlerFactory.getAllDoc(Tour);
exports.getSingleReq = handlerFactory.getDoc(Tour, { path: 'reviews' });

exports.toursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avePrice: { $avg: '$price' },
        aveRating: { $avg: '$ratingsAverage' },
        numRatings: { $sum: '$ratingsQuantity' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avePrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.monthlyTours = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const plans = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01 `),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursMon: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } }, //adds the month fiedl
    { $project: { _id: 0 } }, //it hides the id field
    { $sort: { numToursMon: -1 } },
    { $limit: 12 }, //or {$limit:6}
  ]);
  res.status(200).json({
    status: 'success',
    data: { plans },
  });
});

// for example we include this route
// tour.route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(toursControllers.getToursWithin);
// api/v1/tours/tours-within/distance/200/center/1.00223,0.5552/unnit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // if the unit is equal to miles,
  // well then the result here should be distance.So basically our original radius divided by 3963.2. Okay, so again, that is the radius of the Earth in miles. Okay, and otherwise, we will then assume that it's kilometer. And so if it is kilometers, then it is the distance divided by 6,378.1 kilometers.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng)
    next(
      new AppGlobalErrorClass(
        400,
        'Please provide lat & lng, in the format of lat,lng ',
      ),
    );
  // console.log(distance, latlng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    next(
      new AppGlobalErrorClass(
        400,
        'Please provide lat & lng, in the format of lat,lng ',
      ),
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  //  TOUR IMAGECOVER
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // TOUR IMAGES ARRAY
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});
