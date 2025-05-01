const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppGlobalErrorClass = require('../utils/appGlobalError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

// const sendEmail = require('../utils/email');
const Email = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });

const tokenRes = (user, statuscode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, we only set for production only
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // hiding the password in data
  user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });

  // before the cookies set this code

  // res.status(statuscode).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user,
  //   },
  // });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChanged: req.body.passwordChanged,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  });

  // const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRESIN,
  // });  use the above func fo rtoken

  // const token = generateToken(userData._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: userData,
  //   },
  // });

  //  http://127.0.0.1:3000/me
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(userData, url).sendWelcome();
  tokenRes(userData, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // 1) check email or password exits or not if not then retun
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppGlobalErrorClass(401, 'Please provide email or password!'),
    );
  // 2)find the curt user with email  if not match any user or email or passwrd wrong then send error 401 incorrt
  const user = await User.findOne({ email: email }).select('+password');
  // const correct = user.correctPassword(user.password, password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppGlobalErrorClass(401, 'Incorrect email or password'));
  }
  // 3) if all crrt then send res
  // res.status(200).json({
  //   status: 'success',
  //   token: generateToken(user._id),
  // });
  tokenRes(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING THE TOKEN & CHECK IF EXITS
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    // console.log(token);

    return next(
      new AppGlobalErrorClass(
        401,
        'Your not logged in, Please login to get access!',
      ),
    );
  }

  // 2) VERIFICATION TOKEN

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);

  // 3) CHECK IF USER STILL EXITS
  const freshUser = await User.findById(decode.id);

  if (!freshUser)
    return next(
      new AppGlobalErrorClass(
        401,
        'The user belonging to this token does no longer exits! Please signup again',
      ),
    );

  // 4) CHECK IS USER CHANGED PASSWORD AFTER THE TOKEN HAS ISSUD
  if (freshUser.checkPasswordChanged(decode.iat)) {
    return next(
      new AppGlobalErrorClass(401, 'You changed password!, please login again'),
    );
  }

  //  5) IS ALL OK THEN NEXT()
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles = ['admin','lead-guid']  role= 'user' not include
    console.log(req.user.role, req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppGlobalErrorClass(
          403,
          'You do not have purmissions to perform this action',
        ),
      );
    }
    next();
  };

exports.forgotpassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON POSTED EMAIL

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    //if there is no user with that email
    return next(
      new AppGlobalErrorClass(404, "there's no user with that email "),
    );
  }

  // 2) GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createForgotPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // await user.save();
  // user.save({validateBeforeSave:false}) u can also set this if validation is applying before saving
  //  3) SEND IT TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  // const message = `forgot your password ? please patch a request with new password to : ${resetURL} \n . if not . ignore this message`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'your password reset token is valid for 10 minutes !!',
    //   message,
    // });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'token sent to the email ',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppGlobalErrorClass(
        500,
        'There was an error sending the email, Try again later!',
      ),
    );
  }
});

exports.resetpassword = catchAsync(async (req, res, next) => {
  // 1 GET USER BASED ON TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 IF TOKEN NOT EXPIRED & THERE IS USER EXITS,SET THE NEW PASSWORD

  if (!user) {
    return next(
      new AppGlobalErrorClass(400, 'Token is invalid or has expired'),
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //  3 UPDATED THE PASSWORDCHANGED FIELD FOR CURT USER USING THE MIDDWALRE
  //  4 log the user in & send jwt
  // const token = generateToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });

  tokenRes(user, 200, res);
});

exports.updatepassword = catchAsync(async (req, res, next) => {
  // 1 GET USER FROM COLLECTION
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(
      new AppGlobalErrorClass(400, 'Please login to do this operation'),
    );
  }

  // 2 CHECK IF POSTED PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.oldpassword, user.password))) {
    return next(
      new AppGlobalErrorClass(401, 'Your current Password is not matched'),
    );
  }
  // 3 IF SO, UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordconfirm;
  await user.save();

  // 4 LOG THE USER IN SEND JWT
  tokenRes(user, 200, res);
});

// AFTER LOGIN CHECKING JWT OF COOKIE THEN SET current USER ON REQ
exports.loginProtect = async (req, res, next) => {
  // 1) GETTING THE TOKEN & CHECK IF EXITS

  if (req.cookies.jwt) {
    // 2) VERIFICATION TOKEN
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      console.log(decode);

      // 3) CHECK IF USER STILL EXITS
      const freshUser = await User.findById(decode.id);

      if (!freshUser) return next();

      // 4) CHECK IS USER CHANGED PASSWORD AFTER THE TOKEN HAS ISSUD
      if (freshUser.checkPasswordChanged(decode.iat)) {
        return next();
      }

      // 5) IF USER EXITS
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  //  6) IS ALL OK THEN NEXT()
  next();
};

exports.logout = async (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  res.cookie('jwt', 'loggedout', cookieOptions);
  res.status(200).json({ status: 'success' });
};
