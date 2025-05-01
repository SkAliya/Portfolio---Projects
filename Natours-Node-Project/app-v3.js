const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const toursRouter = require(`${__dirname}/routes/toursRoutes`);
const usersRouter = require(`${__dirname}/routes/usersRoutes`);

const app = express();

// MIDDLEWARES

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
  next();
});

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
// no need to send res as above we just defin an err obj nd pass it to next() nd the nxt middlwre will recives that err from nxt nd use it in global handler express error handler middleware
app.all('*', (req, res, next) => {
  const err = new Error(
    `The req url ${req.originalUrl} not found on this server`,
  );
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// GLOBAL ERROR HANDLER MIDDLEWARRE
// express error handler middleware
app.use((err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || '500';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
module.exports = app;
