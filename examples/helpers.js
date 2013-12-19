// Helper to chain `this`
var fluent = function(f) {
  return function() {
    f.apply(this, arguments);
    return this;
  };
};
