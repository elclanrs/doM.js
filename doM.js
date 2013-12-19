/**
 * doM
 * "do" monad syntax for JavaScript
 * @author: Cedric Ruiz
 * @license MIT
 */
(typeof window !== 'undefined' ? window : global).doM = (function() {

  var trim = function(s) {
    return s.trim();
  };

  var replace = function(regex, replacement) {
    return function(s) {
      return s.replace(regex, replacement);
    };
  };
  
  var doM = function(f) {
    
    var unit = /return (.+)$/
      , backcall = /(.+) <- (.+)/
      , method = /\$(\w+)\(/
      , end = '';
    
    return Function(f
      .toString()
      .split(/[\n;]/)
      .slice(1,-1)
      .map(trim)
      .filter(Boolean)
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
      .map(replace(/\{;$/, '{'))
      .join('') + end
    )();
  };

  return doM;
}());
