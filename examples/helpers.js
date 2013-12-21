var extend = function(a, b) {
  for (var i in b)
    a[i] = b[i];
  return a;
};

// Chain a new `this`
var fluent = function(f) {
  return function() {
    var clone = extend(Object.create(null), this);
    f.apply(clone, arguments);
    return clone;
  };
};
