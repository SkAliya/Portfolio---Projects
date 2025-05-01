// import validator from 'validator';es6
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

// /////////////////////////////////doc new tour creating using mongoose model & schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      minLength: [
        6,
        'A tour name must have greater or eaual than  6 charaters',
      ],
      maxLength: [40, 'A tour name must have less or equal than  40 charaters'],
      // validate: [validator.isAlpha, 'A tour name only contains charaters'], this is not quite usful because it not taking spaces so we use regex instead simply
      validate: [
        /^[A-Za-z\s]+$/,
        'A tour name only contains charaters &  spaces',
      ],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      required: [true, 'A tour must have description'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour ratings must be above 1.0'],
      max: [5, 'A tour ratings must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6667 -> 4.7 /4.6667 ->46.667->47 ->4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    summary: {
      type: String,
      required: [true, 'A tour must have summary'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // latest mongoose method if timestamps:true instead of manually using date.now
    },
    description: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
    },
    price: {
      type: Number,
      default: 200,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to new currt doc not the updated 1 when update doc there is no pointing to this
          return this.price > val;
        },
        message: `A tour Discount price ({VALUE}) must less than regular price `, //here mongoose gives us the value
      },
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    // guides: Array, //EMBEDDING WAY BY SUPPLYING IDS WHEN TOUR CREATING

    // for child referencing using not embedding directl users data instead clhild referncing tour is parent user is child nd his ids as used for refercing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // dont need this becuse we r using virtual populate way u can also do this way but reviews array may increase we dont want that
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual properties:
tourSchema.virtual('durationWeeks').get(function () {
  return Math.floor(this.duration / 7);
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//DOCUMENT MIDDLEWARES OF IN MONGOOSE
// DOCUMENT MIDDLWARE:runs before .save & .create not for update ok
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/////////////we can so many pre middlwraes as we sadi
// tourSchema.pre('save', function (next) {
//   console.log('i will run before saved lol');
//   next();
// });

// //////////// post middlwre
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

tourSchema.pre('save', async function (next) {
  const promiseArray = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(promiseArray);
  next();
});

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `query takes time to create find ${Date.now() - this.start} milliseconds `,
  );
  // console.log(docs);
  next();
});

tourSchema.pre(/^find/, function (next) {
  // this.populate('guides');
  this.populate({
    path: 'guides',
    select: '-__v -passwordChanged',
  }).populate({
    path: 'reviews',
  });
  // .populate({
  // path: 'reviews',
  // });
  //this.populate({ path: 'reviews' }); // no need of this, if ur using populate nrml way then use this if u using virtual way then use the above virtual way see virtual middlwre creates for populating reviews of tour virtually
  next();
});

// instead of using populate method u can virtually populate reviews data into tour each by specifying
//  AGGREGATE MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

// my expermt
// tourSchema.query.byName = function (name) {
//   return this.where({
//     name: new RegExp(name, 'i'),
//   });
// };
const Tour = mongoose.model('Tour', tourSchema);

// ONLY FOR TESTING PURPOSE WE CREATE NEW DOC FORM MODEL FROM SCHMES
// const testTour = new Tour({
//   name: 'Test1',
//   price: 666,
// });

// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log('Error 💥', err));

module.exports = Tour;
