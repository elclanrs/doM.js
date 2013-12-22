# doM
"do" monad syntax for JavaScript.  
**This is just a proof of concept, not to use in production**  
**Demo:** http://jsbin.com/omUxotAm/1/edit

## Usage
Create your monad as an object, use `this` as monadic value. For example:

```javascript
// Maybe monad
var Maybe = {
  unit: function(x) {
    return this.just(x);
  },
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

In ES6 you can use destructuring assignment:

```javascript
// This works in Firefox today
var result = doM(function() {
  a <- add(1, 2);
  [b, c] <- pair(3, 4);
  return a + b + c;
});
```

## Testing monad laws

```javascript
var by2 = function(x) {
  if (x == null) {
    return Maybe.nothing();
  }
  return Maybe.just(x*2);
};

var maybe = Maybe.unit(2);

// Left identity
maybe.bind(by2).valueOf() == by2(2).valueOf() // true
// Right identity
maybe.bind(function(x){ return Maybe.unit(x) }).valueOf() == maybe.valueOf() // true
// Associativity
maybe.bind(function(x){ return by2(x).bind(by2) }).valueOf() == maybe.bind(by2).bind(by2).valueOf() // true
```

## Limitations & workarounds

- Closures don't work (TODO).
- `Function.prototype.toString` is not reliable in old browsers.
- Don't forget the semicolons. `doM` uses loose regexes to transform the syntax.
- Only standard `// comments` are parsed.
- `doM` can't be nested, but you can (and should) chain a previous computation of the same monad:

```javascript
var resultA = doM(function() {
  x <- add(1,2);
  y <- add(x,1);
  return x * y;
});

var resultB = doM(function() {
  x <- resultA;
  return x + 1;
});
```

- JSHint will complain about the syntax, but you may try these options:

```javascript
// Disable warnings

/*jshint expr:true */

// Ignore block

/* jshint ignore:start */
var result = doM(function() {
  ...
});
/* jshint ignore:end */
```

