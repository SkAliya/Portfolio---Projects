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

// console.log(app.get('env'));
// console.log(process.env);
// const port = 3000;
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('listening for request......');
});

// UNHANDLER REJECTIONS
// whenever like databse connectoion failed with mongoose mongodb like worng passwrd any errors async comes then this err wont handle by our globalerrcontrol so we have to handlw those outside of express err handler so create this eventhandler we already know how works check the events lectors nd close the server if unhandlrejecs occurs then exit the app
process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name);
  console.log('UNHANDLED REJECTIONS 💥 : Shutting down the app.....');
  server.close(
    () => process.exit(1), //0-> for success 1->for error
  );
});
