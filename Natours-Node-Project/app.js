const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const AppGlobalErrorClass = require('./utils/appGlobalError');
const errorController = require('./controllers/errorController');
const bookingsController = require("./controllers/bookingsController")

const toursRouter = require(`${__dirname}/routes/toursRoutes`);
const usersRouter = require(`${__dirname}/routes/usersRoutes`);
const reviewsRouter = require(`${__dirname}/routes/reviewsRoutes`);
const viewsRouter = require(`${__dirname}/routes/viewsRoutes`);
const bookingsRouter = require(`${__dirname}/routes/bookingsRoutes`);

const app = express();

///////////////////////////////
app.enable("trust proxy");


/////////////////////////////
// PUG ADDING
app.set('view engine', 'pug');
// app.set('views', `${__dirname}/views/base`); // old way replace all in this
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES

// CROS SETTING
// implementing cors 
app.use(cors());

// access conteoll allow origin *
// for frontend natours.com
// app.use(cors({
//   origin:"https://www.natours.com"
// }))
app.options('*', cors());
// app.options("/api/v1/tours/:id",cors())

// 1 SET SECUIRTY HTTP HEADERS
app.use(helmet());

// 2 DEVELOPEMNT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER, READING DATA FROM BODY INTO REQ.BODY
// app.use(express.json());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//cookie parser
app.use(cookieParser());

// Data sanitization againt NoSQL query injections
app.use(mongoSanitize());

// Data sanitization againt XSS
app.use(xss());

//Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

// COMRESSING FILES
app.use(compression());

// STATIC FILES LOADING liek html overview html images css js files like . USING STATIC middle
// app.use(express.static(`${__dirname}/public`)); //replacing with path
app.use(express.static(path.join(__dirname, 'public')));

// LIMIT REQ FROM SAME API
const limitOptions = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,Please try again after 1 hour',
});

app.use('/api', limitOptions);

app.post("/webhook-checkout", express.raw({ type: "application/json" }), bookingsController.webhookCheckout);

// FOR CHECKING PURPOSE USE THESE MIDDLWARES
app.use((req, res, next) => {
  console.log('hii im from middleware');
  next();
});

app.use((req, res, next) => {
  console.log('hii im from middleware2');
  req.requestTime = new Date().toISOString();
  // console.log(x);
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// pug checking base file rendering or not
// app.get('/', (req, res) => {
//   res.status(200).render('base');
// });
// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tourName: 'Zingle Bell',
//     user: 'Aliya',
//   });
// });

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],
//       baseUri: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', // Leaflet script source
//         'http:',
//         'data:',
//       ],
//       frameSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       styleSrc: [
//         "'self'",
//         'https:',
//         "'unsafe-inline'",
//         'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', // Leaflet stylesheet source
//       ],
//       workerSrc: ["'self'", 'data:', 'blob:'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: [
//         "'self'",
//         'data:',
//         'blob:',
//         'https://a.tile.openstreetmap.org', // Allow OpenStreetMap images
//         'https://b.tile.openstreetmap.org', // Add if you need to allow additional subdomains
//         'https://c.tile.openstreetmap.org', // Add if you need to allow additional subdomains
//       ],
//       connectSrc: ["'self'", 'blob:'],
//       upgradeInsecureRequests: [],
//     },
//   }),
// );

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://unpkg.com/leaflet@1.9.4/dist/leaflet.css https://unpkg.com/leaflet@1.9.4/dist/leaflet.js https://cdnjs.cloudflare.com/ajax/libs/axios/1.8.4/axios.min.js https://js.stripe.com/v3/;",
  );
  next();
});
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src 'self' https://unpkg.com/leaflet@1.9.4/dist/leaflet.css https://unpkg.com/leaflet@1.9.4/dist/leaflet.js https://cdn.jsdelivr.net/npm/axios@1.8.4/dist/axios.min.js;",
//   );
//   next();
// });

// ROUTES FUNCTIONS
/////////////////////////////////////////////////////////

// ROUTING
// MOUNTING MULTIPLE ROUTES USING EXPRESS ROUTER JUT CHANGING SOME CODE ALL SAME WORKS

// VIEWS ROUTES
app.use('/', viewsRouter);

// TOURS ROUTEING
app.use('/api/v1/tours', toursRouter);

// USERS ROUTING
app.use('/api/v1/users', usersRouter);

// REVIEWS ROUTING
app.use('/api/v1/reviews', reviewsRouter);

// BOOKINGS ROUTING
app.use('/api/v1/bookings', bookingsRouter);

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
