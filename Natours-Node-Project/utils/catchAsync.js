module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

//the abode code without arrow funcs
// function catchAsync(fn) {
//   return function (req, res, next) {
//     return fn(req, res, next).catch(next);
//   };
// }
