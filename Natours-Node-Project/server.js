const mongoose = require('mongoose');
const dotenv = require('dotenv');

// UNCATCHEXCEPTIONS
process.on('uncaughtException', (err) => {
  console.log(err.message, err.name, err);
  console.log('UNHANDLED REJECTIONS 💥 : Shutting down the app.....');

  process.exit(1); //0-> for success 1->for error
  // here server not exits so we can close server instAeD DIRECTLY EXIT PROCESS
});

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

// whenever like databse connectoion failed with mongoose mongodb like worng passwrd any errors async comes then this err wont handle by our globalerrcontrol so we have to handlw those outside of express err handler so create this eventhandler we already know how works check the events lectors nd close the server if unhandlrejecs occurs then exit the app
process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name, err);
  console.log('UNHANDLED REJECTIONS 💥 : Shutting down the app.....');
  server.close(
    () => process.exit(1), //0-> for success 1->for error
  );
});

// console.log(x);

// // after the hadnler this may catch err if before the handler then this not catch
// console.log(x);

///////////////////
// SIGTERM ERROR CHATCHING OF HEROKU
process.on('SIGTERM', (err) => {
  console.log(err.message, err.name, err);
  console.log('SIGTERM RECIVIED 💥 : Shutting down GRACEFULLY.....');
  server.close(
    () => { console.log("💥Process terminated!"); }
  );
});