const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// MIDDLEWARES

app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  console.log('hii im from middleware');
  next();
});

app.use((req, res, next) => {
  console.log('hii im from middleware2');
  req.requestTime = new Date().toISOString();
  next();
});

let toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ROUTES FUNCTIONS
/////////////////////////////////////////////////////////

// TOURS HANDLERS

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
    }
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
    }
  );
};

const deleteReq = (req, res) => {
  const id = req.params.id;
  console.log(id);

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
    }
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
// MOUNTING MULTIPLE ROUTES USING EXPRESS ROUTER JUT CHANGING SOME CODE ALL SAME WORKS

// TOURS ROUTEING
const toursRouter = express.Router();
app.use('/api/v1/tours', toursRouter);

toursRouter.require('/').get(getReq).post(postReq);
toursRouter.require('/:id').get(getSingleReq).patch(patchReq).delete(deleteReq);

// USERS ROUTING
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
