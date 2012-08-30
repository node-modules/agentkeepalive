module.exports = function (n, fn) {
  var called = false;
  return function (err) {
    if (called) {
      return;
    }
    if (err) {
      called = true;
      return fn(err);
    }
    --n || fn();
  };
};
