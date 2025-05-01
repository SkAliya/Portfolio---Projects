const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingsModel');
const Tour = require('../models/toursModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./../controllers/handlerFactory');

exports.getCheckout = catchAsync(async (req, res, next) => {
  //  1) get current booked tour/
  const tour = await Tour.findById(req.params.tourid);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourid}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourid,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) send checkout session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.bookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
//   // next();
// });

const bookingCheckout = async (session) => {
  const tour = sesion.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].price_data.unit_amount / 100;
  await Booking.create({ tour, user, price });
}

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`WEBHOOK ERROR: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    bookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });

})

exports.createBooking = handlerFactory.createDoc(Booking);
exports.getAllBookings = handlerFactory.getAllDoc(Booking);
exports.getSingleBooking = handlerFactory.getDoc(Booking, { path: 'user' });
exports.updateBooking = handlerFactory.updateDoc(Booking);
exports.deleteBooking = handlerFactory.deleteDoc(Booking);
