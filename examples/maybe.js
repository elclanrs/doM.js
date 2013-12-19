// Maybe monad
var Maybe = {
  unit: fluent(function(x) {
    this.x = x;
  }),
  bind: function(f) {
    if (this.isNothing) {
      return this.nothing();
    } else if (this.isJust) {
      return f.call(this, this.x);
    }
  },
  nothing: fluent(function() {
    this.x = null;
    this.isNothing = true;
    this.toString = function() {
      return 'Nothing';
    };
  }),
  just: fluent(function(x) {
    this.x = x;
    this.isJust = true;
    this.toString = function() {
      return 'Just: '+ JSON.stringify(this.x);
    };
  }),
  valueOf: function() {
    return this.x;
  }
};

// Computation that may fail
var add = function(x, y) {
  if (x == null || y == null) {
    return Maybe.nothing();
  }
  return Maybe.just(x + y);
};

// Success
var result = doM(function() {
  x <- add(1,2);
  y <- add(x,2);
  z <- add(x,y);
  return x * y * z;
});

console.log(result.toString()); //=> Just 120

// Fail
var result = doM(function() {
  x <- add(1,2);
  y <- add(x,null);
  z <- add(x,y);
  return x * y * z;
});

console.log(result.toString()); //=> Nothing
