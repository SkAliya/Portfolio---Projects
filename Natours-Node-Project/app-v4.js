const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppGlobalErrorClass = require('./utils/appGlobalError');
const errorController = require('./controllers/errorController');

const toursRouter = require(`${__dirname}/routes/toursRoutes`);
const usersRouter = require(`${__dirname}/routes/usersRoutes`);

const app = express();

// GLOBAL MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// STATIC FILES LOADING liek html overview html images css js files like . USING STATIC middle
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('hii im from middleware');
  next();
});

app.use((req, res, next) => {
  console.log('hii im from middleware2');
  req.requestTime = new Date().toISOString();
  // console.log(x);
  // console.log(req.headers);
  next();
});

const limitOptions = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,Please try again after 1 hour',
});

app.use('/api', limitOptions);
// ROUTES FUNCTIONS
/////////////////////////////////////////////////////////

// ROUTING
// MOUNTING MULTIPLE ROUTES USING EXPRESS ROUTER JUT CHANGING SOME CODE ALL SAME WORKS

// TOURS ROUTEING
app.use('/api/v1/tours', toursRouter);

// USERS ROUTING
app.use('/api/v1/users', usersRouter);

// MIDDLEWARE FOR UNHANDLED ROUTES

// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `The req url ${req.originalUrl} not found on this server`,
//   });
// });

// AFTER THE ERROR MIDDLEWARE USED
// here we dont need to set this data everytym for each error catch so we can use calss for this
// see the utils the globalErrorClass file
app.all('*', (req, res, next) => {
  // const err = new Error(
  //   `The req url ${req.originalUrl} not found on this server`,
  // );
  // err.status = 'fail';
  // err.statusCode = 404;  this all replace by the Appglobalerrorclass we need to pass the stscode & messg
  // next(err);

  next(
    new AppGlobalErrorClass(
      404,
      `The req url ${req.originalUrl} not found on this server`,
    ),
  );
});

// // GLOBAL ERROR HANDLER MIDDLEWARRE
// // express error handler middleware
// app.use((err, req, res, next) => {
//   console.log(err.stack); //Error: The req url /api/v1/tourssss not found on this server

//   err.status = err.status || 'error';
//   err.statusCode = err.statusCode || '500';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

// now the above global err middlware commtd is place in errorController.js file under controllers

app.use(errorController);

module.exports = app;
