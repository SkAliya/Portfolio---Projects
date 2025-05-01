const AppGlobalErrorClass = require('../utils/appGlobalError');
const catchAsync = require('../utils/catchAsync');
// const User = require('./../models/userModel');
// const Review = require('./../models/reviewsModel');
const APIFeatures = require('../utils/apiFeatures');
// const filteredFields = require('./usersControllers');

exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return next(new AppGlobalErrorClass(404, 'No Doc found with this ID'));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // let fields = req.body;
    // if (Model === User) fields = filteredFields(req.body, 'name', 'email');

    // const doc = await Model.findByIdAndUpdate(req.params.id, fields, {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppGlobalErrorClass(404, 'No document found with that ID'),
      );
    }
    res.status(200).send({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    if (!newDoc) {
      return next(
        new AppGlobalErrorClass(404, 'No document found with that ID'),
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getAllDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourid) filter = { tour: req.params.tourid };
    // BUILDING QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    // EXECUTING QUERY
    const docs = await features.query;
    // const docs = await features.query.explain();

    // SEND RESPONSE
    res.status(200).send({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        docs,
      },
    });
  });

exports.getDoc = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    // const doc = await Model.findById(req.params.id).populate('reviews');
    // const doc = await Tour.findById(req.params.id).populate('guides');
    const doc = await query;
    if (!doc) {
      return next(
        new AppGlobalErrorClass(404, 'No document found with that ID'),
      );
    }

    res.status(200).send({
      status: 'success',
      data: {
        doc,
      },
    });
  });
