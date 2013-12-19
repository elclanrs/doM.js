// Writer monad
var Writer = {
  unit: fluent(function(x, w) {
    this.w = w == null ? [] : [w];
    this.x = x;
  }),
  bind: fluent(function(f) {
    var w = this.w;
    f.call(this, this.x);
    this.w = w.concat(this.w);
  }),
  get: function() {
    return this.w;
  },
  tell: fluent(function(w) {
    this.w = [w];
  }),
  toString: function() {
    return 'Writer: ('+ this.x +', '+ JSON.stringify(this.w) +')';
  },
  valueOf: function() {
    return this.x;
  }
};

var add = function(x, y) {
  return Writer.unit(x + y, 'add '+ x +' plus '+ y);
};

var result = doM(function() {
  x <- add(1,2);
  y <- add(x,2);
  $tell('multiply '+ x +' by '+ y);
  return x * y;
});

console.log(result.toString());
//^ State (15, ["add 1 plus 2, add 3 plus 2", "multiply 3 by 5"])
