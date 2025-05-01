// GLOBAL ERROR HANDLER MIDDLEWARRE
const AppGlobalErrorClass = require('../utils/appGlobalError');

const handlerForInvalidId = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppGlobalErrorClass(400, message);
};

const handleDuplicatePost = (error) => {
  const value = error.message.match(/"([^"]*)"/)[0];
  const message = `Duplicate field value ${value}, Please use another`;
  return new AppGlobalErrorClass(400, message);
};

const handleValidationErrors = (error) => {
  const value = Object.values(error.errors).map((err) => err.message);
  const message = `Invalid input data: ${value.join('. ')}`;
  return new AppGlobalErrorClass(400, message);
};

const handleInvalidToken = () =>
  new AppGlobalErrorClass(401, 'Invalid token, Please login again');
const handleTokenExpired = () =>
  new AppGlobalErrorClass(401, 'Token expired, Please login again');

// express error handler middleware
const sendErrorDev = (req, res, err) => {
  // A)  API ERRORS CATCHING
  // console.log(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERING ERRORS VIEWS
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (req, res, err) => {
  //  A) API ERRORS
  if (req.originalUrl.startsWith('/api')) {
    // A.1) Operational , trusted Error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //  A.2) Programming or other Unknow errors, dont leak error details
    //  A.2.1) Log error
    console.error('Error 💥:', err.message);
    //  A.2.2) Send  generic message to
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      // error: err,
    });
  }

  // B) RENDERING ERRORS VIEWS
  // B.1) Operational , trusted Error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  //  B.2) Programming or other Unknow errors, dont leak error details
  //  B.2.1) Log error
  console.error('Error 💥:', err.message);
  //  B.2.2) Send  generic message to
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack); //Error: The req url /api/v1/tourssss not found on this server

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  // IF DEV ENV SEND ERR TO RRRDEV FUNC
  if (process.env.NODE_ENV === 'development') sendErrorDev(req, res, err);
  // IF PRODUC ERR THEN SEND ERR INTO RELEVENT HANDLERS DEFINED ABOVE
  else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handlerForInvalidId(error);
    if (error.code === 11000) error = handleDuplicatePost(error);
    if (error.name === 'ValidationError') error = handleValidationErrors(error);
    if (error.name === 'JsonWebTokenError') error = handleInvalidToken();
    if (error.name === 'TokenExpiredError') error = handleTokenExpired();

    // console.log(error.message, err.message);
    sendErrorProd(req, res, error);
  }
};
