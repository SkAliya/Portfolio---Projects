const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/toursModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewsModel');

dotenv.config({ path: './config.env' });

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
// const tours = JSON.parse( fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),);
// actuall data imprting first delete unnessary daata form compass db then import using this cmd " node file path plus --delete/--import
// node ./dev-data\data\import-dev-data.js
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// importig data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully imported from file');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //this will exit the server even wt the result is err or succ
};

// deleteing data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted from db');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
