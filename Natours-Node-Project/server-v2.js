const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// START SERVER
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log('CONNECTION SUCCESSFULL WITH DB');
  });

// /////////////////////////////////doc new tour creating using mongoose model & schema

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 5.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

// THIS IS FOR TESTING PURPOSE ONLY WE CREATE THE DOC FROM MODEL
const testTour = new Tour({
  name: 'Test1',
  price: 666,
});

testTour
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log('Error 💥', err));

// console.log(app.get('env'));
// console.log(process.env);
// const port = 3000;
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening for request......');
});

// const x = 20;
