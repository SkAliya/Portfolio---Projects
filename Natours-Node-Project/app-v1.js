const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// MIDDLEWARES

app.use(morgan('dev')); //diif styles u can see output fomrt tiny,short,coomon,dev

// global middleware - 1
app.use(express.json()); //used for getting req.body

// global middleare - 2
// app.use((req, res, next) => {
//   console.log('hii im from middleware');
//   next();
// });

// // global middle - 3
// app.use((req, res, next) => {
//   console.log('hii im from middleware2');
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.get('/', (req, res) => {
//   res.send('Your on port 3000');
// });
// app.get('/jinglebell', (req, res) => {
//   res.status(200).json({ message: 'Welcome to the server', status: '200' });
// });
// app.post('/', (req, res) => {
//   res.send('You  can now post on server with port 3000');
// });

// NOW ACTUALLY MAKING LISSTENING TO REQUEST 'GET' FOR DATA

let toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

// console.log(toursData);

// ROUTES FUNCTIONS

// app.get('/api/v1/tours', (req, res) => {
//   res.status(200).send({
//     status: 'success',
//     results: toursData.length,
//     data: {
//       tours: toursData,
//     },
//   });
// });

// app.post('/api/v1/tours', (req, res) => {
//   // const newTour = { ...req.body, id: toursData.at(-1).id + 1 };
//   // const newTour = Object.assign({ id: toursData.at(-1).id + 1 }, req.body);
//   const newId = toursData[toursData.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   // console.log(newTour);

//   toursData.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(toursData),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tours: toursData,
//         },
//       });
//     }
//   );
// });

// app.get('/api/v1/tours/:id', (req, res) => {
//   const id = req.params.id;
//   console.log(id);
//   const tour = toursData.find((tour) => tour.id === Number(id));

//   if (!tour) {
//     return res.status(404).send({
//       status: 'fail',
//       message: 'Tour not found: Invalid ID',
//     });
//   }

//   res.status(200).send({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// app.patch('/api/v1/tours/:id', (req, res) => {
//   const id = req.params.id;

//   if (id > toursData.length) {
//     return res.status(404).send({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   const updatedData = toursData.map((tour) => {
//     if (tour.id === Number(id)) {
//       return { ...tour, ...req.body };
//     } else return tour;
//   });

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(updatedData),
//     (err) => {
//       res.status(200).send({
//         status: 'success',
//       });
//     }
//   );
// });

// app.delete('/api/v1/tours/:id', (req, res) => {
//   const id = req.params.id;
//   console.log(id);

//   if (Number(id) > toursData.length) {
//     return res.status(404).send({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   const updatedData = toursData.filter((tour) => tour.id !== Number(id));

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(updatedData),
//     (err) => {
//       res.status(204); //204 No Content: The request was successful, but there's no content to return.

//       res.status(200).send({
//         status: 'success',
//         message: 'successfully deleted',
//       });
//     }
//   );
// });

// TOURS HANDLERS
// REFRACTORING CODE USING FUNCTIONS

const getReq = (req, res) => {
  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    results: toursData.length,
    data: {
      tours: toursData,
    },
  });
};

const postReq = (req, res) => {
  const newId = toursData[toursData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  toursData.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: toursData,
        },
      });
    },
  );
};

const patchReq = (req, res) => {
  const id = req.params.id;

  if (id > toursData.length) {
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  const updatedData = toursData.map((tour) => {
    if (tour.id === Number(id)) {
      return { ...tour, ...req.body };
    } else return tour;
  });

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedData),
    (err) => {
      res.status(200).send({
        status: 'success',
      });
    },
  );
};

const deleteReq = (req, res) => {
  const id = req.params.id;
  // console.log(id);

  if (Number(id) > toursData.length) {
    return res.status(404).send({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  const updatedData = toursData.filter((tour) => tour.id !== Number(id));

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedData),
    (err) => {
      res.status(204).json({
        status: 'success',
        message: 'successfully deleted',
        data: null,
      });
    },
  );
};

const getSingleReq = (req, res) => {
  const id = req.params.id;
  console.log(id);
  const tour = toursData.find((tour) => tour.id === Number(id));

  if (!tour) {
    return res.status(404).send({
      status: 'fail',
      message: 'Tour not found: Invalid ID',
    });
  }

  res.status(200).send({
    status: 'success',
    data: {
      tour,
    },
  });
};

// USERS HANDLERS

const getAllUsers = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};
const createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};
const getSingleUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};

// ROUTING

// 1 WAY OF REQUESTING

// app.get('/api/v1/tours', getReq);
// app.post('/api/v1/tours', postReq);
// app.get('/api/v1/tours/:id', getSingleReq);
// app.patch('/api/v1/tours/:id', patchReq);
// app.delete('/api/v1/tours/:id', deleteReq);

// 2 WAY OF REQUESING using http methods

// TOURS ROUTEING

// app.route('/api/v1/tours').get(getReq).post(postReq);

// // if u write this middleware after the req res cycle done means  after res send then this middleware not run if u want to run this then u need to write this midd in above to reqst func means before res send
// // global middleare - 2
// // app.use((req, res, next) => {
// //   console.log('hii im from middleware');
// //   next();
// // });

// app
//   .route('/api/v1/tours/:id')
//   .get(getSingleReq)
//   .patch(patchReq)
//   .delete(deleteReq);

// MOUNTING MULTIPLE ROUTES USING EXPRESS ROUTER JUT CHANGING SOME CODE ALL SAME WORKS

const toursRouter = express.Router();
app.use('/api/v1/tours', toursRouter);

toursRouter.require('/').get(getReq).post(postReq);
toursRouter.require('/:id').get(getSingleReq).patch(patchReq).delete(deleteReq);

// USERS ROUTING
// app.route('/api/v1/users').get(getAllUsers).post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getSingleUser)
//   .patch(updateUser)
//   .delete(deleteUser);

const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

userRouter.require('/').get(getAllUsers).post(createUser);
userRouter
  .require('/:id')
  .get(getSingleUser)
  .patch(updateUser)
  .delete(deleteUser);

// START SERVER

const port = 3000;
app.listen(port, () => {
  console.log('listening for request......');
});
