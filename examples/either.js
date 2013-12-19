// Either monad
var Either = {
  unit: fluent(function(r) {
    this.r = r;
    this.l = null;
  }),
  bind: function(f) {
    if (this.isLeft) {
      return this.left(this.l);
    } else if (this.isRight) {
      return f.call(this, this.r);
    }
  },
  left: fluent(function(l) {
    this.l = l;
    this.isLeft = true;
    this.toString = function() {
      return "Left: " + this.l;
    };
    this.valueOf = function() {
      return this.l;
    };
  }),
  right: fluent(function(r) {
    this.r = r;
    this.isRight = true;
    this.toString = function() {
      return "Right: " + this.r;
    };
    this.valueOf = function() {
      return this.r;
    };
  })
};

var div = function(x, y) {
  if (y === 0) {
    return Either.left('division by 0');
  }
  return Either.right(x/y);
};

// Success
var result = doM(function() {
  x <- div(4,2);
  y <- div(x,2);
  return x + y;
});

console.log(result.toString()); //=> Right: 3

// Fail
var result = doM(function() {
  x <- div(4,2);
  y <- div(x,0);
  return x + y;
});

console.log(result.toString()); //=> Left: division by 0
