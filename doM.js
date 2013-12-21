/**
 * doM
 * "do" monad syntax for JavaScript
 * @author: Cedric Ruiz
 * @license MIT
 */
(typeof window !== 'undefined' ? window : global).doM = (function() {

  var dotf = function(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(x) {
      return x[f].apply(x, args);
    };
  };

  var doM = function(f) {

    var unit = /return (.+)$/
      , backcall = /(.+) <- (.+)/
      , method = /\$(\w+)\(/
      , comments = /^\/\/.+/
      , end = '';

    return Function(f
      .toString()
      .split(/[\n;]/)
      .slice(1,-1)
      .map(dotf('trim'))
      .filter(Boolean)
      .map(dotf('replace', comments, ''))
      .reduce(function(a, b) {
        return a +';\n'+ b
          .replace(method, '_0 <- this.$1(')
          .replace(unit, 'return this.unit($1)')
          .replace(backcall, function(_, a, b) {
            end += '})';
            return 'return '+ b +'.bind(function(_1){var '+ a +'=_1';
          });
      }, '')
      .split(/\n/)
      .slice(1)
      .map(dotf('replace', /\{;$/, '{'))
      .join('') + end
    )();
  };

  return doM;
}());
