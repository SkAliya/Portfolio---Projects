const mongoose = require('mongoose');
const Tour = require('./toursModel');

const reviewsSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Rewiew cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
    // tour: String,
    // user: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  // console.log(this);
  this.find().select('-__v');
  next();
});

reviewsSchema.pre(/^find/, function (next) {
  // this is my exprmt
  // this.populate({
  //   path: 'tour',
  //   select: '-__v',
  // }).populate({
  //   path: 'user',
  //   select: '-__v',
  // });
  // we dont want to showup others , users(reviwers) data on reviews of tours who revied this like email of urs other sensitive data of reviewer ok so only name of the reviewr is enough
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  // here we not populaitng the tour data in reviews array becuase when u req a tour single then this reviews array contains the same tour  data we r chaining populate method makes slow so make sure if u dont want some type data then u can skip nd use the id simple as before when we not populate anything ok
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // })
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewsSchema.statics.calculateAvgRatings = async function (tourid) {
  const stats = await this.aggregate(
    //this. points to review model
    [
      {
        $match: { tour: tourid },
      },
      {
        $group: {
          _id: '$tour',
          nRatings: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ],
  );

  //   console.log(stats); ///this will giv e the tour with passed tourid in reviews

  // updating the ratings on matchd tour with id
  await Tour.findByIdAndUpdate(tourid, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRatings,
  });
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewsSchema.post('save', function () {
  // Review.calculateAvgRatings(this.tour) we cant call before it review model creeated  so this caclavrg is static method so call like this not like others methods this is static
  // here 'this' points to currt review
  this.constructor.calculateAvgRatings(this.tour);
});

//FINDONEANDUPDATE
// FINDONEANDDELETE
// reviewsSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// await this.findOne doesnot work here ,query has already executed wwe only have doc
// await this.r.constructor.calculateAvgRatings(this.r.tour);
reviewsSchema.post(/^findOneAnd/, async (doc) => {
  // console.log(doc);
  if (doc) {
    await doc.constructor.calculateAvgRatings(doc.tour);
  }
});

const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;
