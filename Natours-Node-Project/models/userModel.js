const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name,email,photo,password,passwordconfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
    minLength: [6, 'A user name must be above 6 characters '],
    maxLength: [40, 'A user name must be below 40 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  // photo: String,
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    // validate: validator.isStrongPassword,
    minLength: [8, 'Password must be above 8 characters '],
    maxLength: [30, 'Password must be below 30 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    // ONLY WORKS FOR SAVE NOT FOR FIND1 & UPDATE ONLY WORKS FOR .SAVE /.CREATE
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Confirm Password must be match with Password',
    },
  },
  passwordChanged: Date,
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Role must be eigther user,guide,lead-guide,admin',
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  oldpassword: String,
  active: {
    type: Boolean,
    default: true,
  },
});

// MIDDLEWARES

// MIDDLEWARE FOR PASSWRD ENCRYPTING
userSchema.pre('save', async function (next) {
  // ONLY RUN THIS FUNC IF PASSD WAS ACTULLY UPDATED OR CREATED NEW
  if (!this.isModified('password')) return next();

  //HASH THE PASSWRD WITH COST OF 12
  this.password = await bcrypt.hash(this.password, 12);

  //DELETE PASSWRDCONFIRM FIELD
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChanged = Date.now() - 1000;
  // this.passwordChanged = Date.now(); this is for exmpl if u chengd passwrd nd get tours immdlry u get err u changed passwd login again for fr that 1 sec time prd u loss login so we do tric is passwdchned set to less than token iat tym so we can even chnged passwd still logged in ok
  next();
});

// qerymidd
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// // _______________________________________________________________________

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkPasswordChanged = function (jwtTimeStampIAT) {
  // console.log(this.passwordChanged);
  if (this.passwordChanged) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChanged.getTime() / 1000,
      10,
    );
    // console.log(
    //   passwordChangedTimeStamp,
    //   jwtTimeStampIAT,
    //   this.passwordChanged,
    // );
    return jwtTimeStampIAT < passwordChangedTimeStamp;
  }
};

userSchema.methods.createForgotPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log('resetToken :', resetToken, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
