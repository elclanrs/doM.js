# doM
"do" monad syntax for JavaScript.  
**Demo:** http://jsbin.com/ademeYuT/1/edit

## Usage
Create your monad as an object, use `this` as monadic value. For example:

```javascript
// Helper to chain `this`
var fluent = function(f) {
  return function() {
    f.apply(this, arguments);
    return this;
  };
};

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
  nothing: fluent(function(x) {
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
      return 'Just: '+ this.x;
    };
  }),
  valueOf: function() {
    return this.x;
  }
};
```

Then build your functions with the monad:

```javascript
// Computation that may fail
var add = function(x, y) {
  if (x == null || y == null) {
    return Maybe.nothing();
  }
  return Maybe.just(x + y);
};
```

And use the `do` syntax by passing a function to `doM`:

```javascript
var result = doM(function() {
  x <- add(1, 2);
  y <- add(x, 2);
  z <- add(x, y);
  return x * y * z;
});
```

`doM` will generate and run the following function:

```javascript
function() {
  return add(1, 2).bind(function(x) {
    return add(x, 2).bind(function(y) {
      return add(x, y).bind(function(z) {
        return this.unit(x * y * z);
      });
    });
  });
}
```

You can also run code inside each sequence, and access the current monadic value with `this`:

```javascript
var result = doM(function() {
  x <- add(1, 2);
  console.log(this.x +' so far');
  y <- add(x, 2);
  console.log(this.x +' so far');
  z <- add(x, y);
  console.log(this.x +' so far');
  return x * y * z;
});
//^ 3 so far
//  5 so far
//  8 so far
//  Maybe {x: 120, ...}
```

To sequence a monad method with no argument you can simply write:

```javascript
var result = doM(function() {
  x <- add(1, 2);
  $tell('add 1 plus 2');
  return x;
});
```

Which is sugar for:

```javascript
var result = doM(function() {
  x <- add(1, 2);
  _ <- this.tell('add 1 plus 2');
  return x;
});
```

The `result` will be the monadic value. `toString` will give you info about the type. And `valueOf` will return the value. Note that `valueOf` can be implicit; here `+` runs `valueOf` and returns the value, in this case a number:

```javascript
result + 2
```
