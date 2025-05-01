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
    console.log(con.connection);
    console.log('CONNECTION SUCCESSFULL WITH DB');
  });

// console.log(app.get('env'));
// console.log(process.env);
// const port = 3000;
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening for request......');
});

// const x = 20;
