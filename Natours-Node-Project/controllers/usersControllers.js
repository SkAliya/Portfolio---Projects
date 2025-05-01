const User = require('../models/userModel');
const AppGlobalErrorClass = require('../utils/appGlobalError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const filteredFields = (reqObj, ...allowfields) => {
  const result = Object.keys(reqObj).reduce((acc, cur) => {
    if (allowfields.includes(cur)) {
      return { ...acc, [cur]: reqObj[cur] };
    } else {
      return acc;
    }
  }, {});
  return result;
};

// WITHOUT IMAGE PROCESSING WITHOUT USING SHARP PACKGE WE R DIRECTLY STORING IN FILESYTEM IN DISCK no need this we have now sharp u can have 2 otions this nd below meroerystroge via sharp packg using
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

// WITH IMAGE PROCESSSING ND ALSO STORING IN MEMERYSTOREGE IN BUFFER ACTULLY THEN APPLY PREOCSSING METHODS
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppGlobalErrorClass(400, 'Please upload only images'));
};

// ______________________________________________________________________
// USERS HANDLERS
// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();

//   res.status(200).send({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.updatedata = catchAsync(async (req, res, next) => {
  // 1 check if req body contains  passwrd or passwrdconfirm
  console.log(req.body);
  console.log(req.file);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppGlobalErrorClass(
        400,
        'This route is not for password update, Please use /updatepassword',
      ),
    );
  }

  // 3 FILTEROUT THE FILDS FROM REQ BODY

  const fields = filteredFields(req.body, 'name', 'email');
  if (req.file) fields.photo = req.file.filename;
  console.log(fields);

  // 3 IF SO. UPDATE FIELDS
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });
  // 4 LOG THE USER DATA
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deletecurrentuser = catchAsync(async (req, res, next) => {
  // for this we need to login then currt loggedin user will delete means active setto false then middwre do the filtering whcih user not active removes means hides from reqsut
  // 1 activate the active field set to false defult it is true when fiedl created user signined in
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // 3 res send with 204 no content
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'this route not yet defined',
  });
};
// exports.getSingleUser = (req, res) => {
//   res.status(500).send({
//     status: 'fail',
//     message: 'this route not yet defined',
//   });
// };
// exports.updateUser = (req, res) => {
//   res.status(500).send({
//     status: 'fail',
//     message: 'this route not yet defined',
//   });
// };

// deleting the 1 of the user in users list of data no need for authorizatiz no need for login direct delete
// exports.deleteUser = (req, res) => {
//   res.status(500).send({
//     status: 'fail',
//     message: 'this route not yet defined',
//   });
// };

exports.getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// const upload = multer({ dest: 'public/img/users' }); replace this
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

// MIDDLEWARE FOR RESIZING PHOTO OF USER

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.deleteUser = handlerFactory.deleteDoc(User);
exports.updateUser = handlerFactory.updateDoc(User);
// exports.createUser = handlerFactory.createDoc(User); we dont need this because we r create user via aunthencation signup
exports.getAllUsers = handlerFactory.getAllDoc(User);
exports.getSingleUser = handlerFactory.getDoc(User);
// module.exports = filteredFields;
