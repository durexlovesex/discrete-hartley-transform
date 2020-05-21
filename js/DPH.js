window.DPH = (function() {
  var cas = function cas(v, n, N) {
    var arg = 2 * Math.PI * v * n / N;
    return Math.cos(arg) + Math.sin(arg);
  }

  var encode = function encode(g) {
    var _g = [];
    var N = g.length;

    for(var v = 0; v < N; v++) {
      var _gv = 0;
      for(var n = 0; n < N; n++) {
        _gv += g[n] * cas(v, n, N);
      }
      _g.push(_gv);
    }

    return _g;
  }

  var decode = function decode(_g) {
    var g = [];
    var N = _g.length;

    for(var v = 0; v < N; v++) {
      var gv = 0;
      for (var n = 0; n < N; n++) {
        gv += _g[n] * cas(v, n, N)  / N;
      }
      g.push(gv);
    }

    return g;
  }

  var reduce = function reduce(_g, m) {
    m = Math.abs(m);
    var result = [];

    if (_g.length < 2) {
      return _g;
    }

    result.push(_g[0]);
    for (var i = 1; i < _g.length - 1; i++) {
      result.push(Math.abs(_g[i]) <= m ? 0 : _g[i]);
    }
    result.push(_g[_g.length - 1]);

    return result;
  }

  var calcLosses = function calcLosses(_x, x) {
    var result = 0;

    for (var i = _x.length - 1; i >= 0; i--) {
      result += Math.pow(_x[i] - x[i], 2);
    }

    result = Math.sqrt(result / (2 * _x.length));

    return result;
  }

  return {
    cas: cas,
    encode: encode,
    decode: decode,
    reduce: reduce,
    calcLosses: calcLosses
  }
})();