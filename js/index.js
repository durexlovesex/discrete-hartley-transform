(function() {
  var stringify = function stringify(data) {
    return JSON.stringify(data)
      .replace(/^\[/, '{')
      .replace(/\]$/, '}')
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
      .replace(/,/g, ', ');
  };

  var scale = 40;
  var graphScale = 3;
  var _drawGrid = function(ctx, nx, ny) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#bebebe';
    for (var i = nx - 1; i >= 0; i--) {
      for (var j = ny - 1; j >= 0; j--) {
        ctx.beginPath();
        ctx.rect(i * scale, j * scale, scale, scale);
        ctx.stroke();
      }
    }
  };

  var drawFigure = function drawFigure(paintElement, x, y) {
    var ctx = paintElement.getContext('2d');
    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, paintElement.width, paintElement.height);
    ctx.fill();
    _drawGrid(ctx, Math.ceil(paintElement.width / scale), Math.ceil(paintElement.height / scale));

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#9999ff';
    for (var i = x.length - 1; i >= 0; i--) {
      var xi = x[i] * scale;
      var yi = y[i] * scale;
      ctx.beginPath();
      ctx.moveTo(xi, yi);
      ctx.lineTo(
        (x[i + 1] !== undefined ? x[i + 1] : x[0]) * scale,
        (y[i + 1] !== undefined ? y[i + 1] : y[0]) * scale
      );
      ctx.stroke();
    }

    ctx.fillStyle = 'red';
    for (var i = x.length - 1; i >= 0; i--) {
      var xi = x[i] * scale;
      var yi = y[i] * scale;
      ctx.beginPath();
      ctx.arc(xi, yi, 5, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    ctx.fillStyle = 'black';
    ctx.font="bold 12px Helvetica";
    for (var i = x.length - 1; i >= 0; i--) {
      var xi = x[i] * scale;
      var yi = y[i] * scale;
      ctx.beginPath();
      var val = '(' + x[i].toFixed(2) + ', ' + y[i].toFixed(2) + ')';
      ctx.fillText(
        val, 
        xi - 30,
        yi - 8
      );
      ctx.fill();
    }
  };

  var drawGraph = function drawGraph(paintElement, dots) {
    var paddingX = 20;
    var paddingY = 20;
    var ctx = paintElement.getContext('2d');
    var sdots = dots.map(function(dot) {return dot * graphScale});

    var maxY = Math.max.apply(null, sdots);
    var minY = Math.min.apply(null, sdots);
    var width = paintElement.width - paddingX * 2;
    var height = maxY + Math.abs(minY);
    paintElement.height = height + paddingY * 2;
    var spacer = width / (sdots.length - 1);

    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, paintElement.width, paintElement.height);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#bebebe';
    for (var j = Math.ceil(height / spacer) + 1; j >= -5; j--) {
      for (var i = Math.ceil(width / spacer) + 5; i >= -5; i--) {
          ctx.beginPath();
          ctx.rect(i * spacer + paddingX , paddingY + j * spacer + maxY % spacer, spacer, spacer)
          ctx.stroke();
      }
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, paddingY + maxY);
    ctx.lineTo(width + paddingX * 2, paddingY + maxY);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'blue';
    // ctx.moveTo(paddingX, paddingY + (-sdots[0]) + maxY);
    sdots.forEach(function(dot, i) {
      ctx.beginPath();
      ctx.rect(paddingX + i * spacer - 3, paddingY + maxY, 6, -dot);//paddingY + maxY )
      ctx.fill();
      // ctx.lineTo(paddingX + i * spacer, paddingY + (-dot) + maxY);
    });

    ctx.fillStyle = 'red';
    sdots.forEach(function(dot, i) {
      ctx.beginPath();
      ctx.arc(paddingX + i * spacer, paddingY + (-dot) + maxY, 3, 0, 2 * Math.PI, false);
      ctx.fill();
    });

    ctx.fillStyle = 'black';
    ctx.font="bold 10px Helvetica";
    dots.forEach(function(dot, i) {
      ctx.beginPath();
      var val = dot.toFixed(2);
      ctx.fillText(
        val, 
        paddingX + i * spacer - 14, 
        paddingY + (-dot * graphScale) + maxY + (val >= 0 ? -5 : 12)
      );
      ctx.fill();
    });
  };

  var execute = function execute() {
    var outputElement = document.getElementById('step-1-output');
    outputElement.innerHTML = '';

    var paintElement = document.getElementById('step-1-paint');
    var xGraphElement = document.getElementById('step-1-x-graph');
    var yGraphElement = document.getElementById('step-1-y-graph');

    var log = function (data, isCode) {
      outputElement.innerHTML += (!data ? '<br>' : '<p>' + data + '</p>\n');
    }
    var round2 = function round2(v) {
      return Math.round10(v, -2)
    }
    var round = function round(v) {
      return Math.round10(v, 0)
    }

    var g = document.getElementById('g').value;

    g = g.replace(/(\{|\()/g, '[');
    g = g.replace(/(\)|\})/g, ']');
    g = JSON.parse(g);

    // var x = [1, 2, 2, 2, 3, 4, 4, 4, 5, 4, 3, 2];
    // var y = [2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 1, 1];
    var x = [];
    var y = [];
    g.forEach((point) => {
      x.push(point[0]);
      y.push(point[1]);
    });

    log('Количество точек <var>n</var> = ' + x.length + '<br>');
    log('Исходные одномерные последовательности:<br>' +
        '<var>x<sub>n</sub></var> = ' + stringify(x) + '<br>' +
        '<var>y<sub>n</sub></var> = ' + stringify(y));

    var _gx = DPH.encode(x).map(round2);
    var _gy = DPH.encode(y).map(round2);

    drawFigure(paintElement, x, y);
    drawGraph(xGraphElement, _gx);
    drawGraph(yGraphElement, _gy);

    log('Выполняется  ДПХ  последовательностей. ' + 
        'В результате получаем следующие последовательности признаков, ' +
        'представляющие исходные координаты границы объекта наблюдения:<br>'+
        '<var>g&#770;<sub>v<sub>x</sub></sub></var> = ' + stringify(_gx) + '<br>' +
        '<var>g&#770;<sub>v<sub>y</sub></sub></var> = ' + stringify(_gy));

    // var gx = DPH.decode(_gx).map(round2);
    // var gy = DPH.decode(_gy).map(round2);
    // log('<var>x&#834;<sub>n</sub></var> = ' + stringify(gx));
    // log('<var>y&#834;<sub>n</sub></var> = ' + stringify(gy));
    // log();
    // log('round2(<var>x&#834;<sub>n</sub></var>) = ' + stringify(gx));
    // log('round2(<var>y&#834;<sub>n</sub></var>) = ' + stringify(gy));

    outputElement = document.getElementById('step-2-output');
    outputElement.innerHTML = '';

    paintElement = document.getElementById('step-2-paint');
    xGraphElement = document.getElementById('step-2-x-graph');
    yGraphElement = document.getElementById('step-2-y-graph');

    log('В зону фильтрации входят коэффициенты ' +
        '<var>g&#770;<sub>v<sub>x</sub></sub></var> и <var>g&#770;<sub>v<sub>y</sub></sub></var>, ' + 
        'координаты которых соответствуют множеству:<br>' +
        '<var>L</var> = {(<var>x<sub>2</sub></var>, <var>y<sub>2</sub></var>), (<var>x<sub>3</sub></var>, <var>y<sub>3</sub></var>), ..., (<var>x<sub>n</sub></var>, <var>y<sub>n</sub></var>)}'
    );

    log('Адресная информация о зоне фильтрации трансформант определяется только двумя крайними координатами множества {<var>L</var>}.');

    var _gx1 = DPH.reduce(_gx, document.getElementById('mx').value);
    var _gy1 = DPH.reduce(_gy, document.getElementById('my').value);

    log('Усеченные входные последовательности классификатора равны:<br>' +
        '<var>g&#770;<sub>v<sub>x</sub></sub></var> = ' + stringify(_gx1.filter(_gi => _gi !== 0)) + '<br>' +
        '<var>g&#770;<sub>v<sub>y</sub></sub></var> = ' + stringify(_gy1.filter(_gi => _gi !== 0))
    );

    var _x1 = DPH.decode(_gx1).map(round2);
    var _y1 = DPH.decode(_gy1).map(round2);

    log('Восстановление изображения границ области произведем по сохраненным коэффициентам. '+
        'Применяя формулу для усеченных последовательностей, получаем следующие оценки ' +
        '<var>x&#834;\'<sub>n</sub></var> и <var>y&#834;\'<sub>n</sub></var>:<br>' +
        '<var>x&#834;\'<sub>n</sub></var> = ' + stringify(_x1) + '<br>' +
        '<var>y&#834;\'<sub>n</sub></var> = ' + stringify(_y1)
    );

    _x1 = _x1.map(round);
    _y1 = _y1.map(round);

    log('После округления получаем значения координат <var>x\'<sub>n</sub></var> и <var>y\'<sub>n</sub></var>:<br>' + 
        '<var>x\'<sub>n</sub></var> = ' + stringify(_x1) + '<br>' +
        '<var>y\'<sub>n</sub></var> = ' + stringify(_y1)
    );

    log('Ошибка восстановления границ:<br>' + 
        '<var>&sigma;<sub>x</sub></var> = ' + round2(DPH.calcLosses(_x1, x), 2) + '<br>' +
        '<var>&sigma;<sub>y</sub></var> = ' + round2(DPH.calcLosses(_x1, x), 2)
    );

    drawFigure(paintElement, _x1, _y1);
    drawGraph(xGraphElement, _gx1.filter(_gi => _gi !== 0));
    drawGraph(yGraphElement, _gy1.filter(_gi => _gi !== 0));

    //----------------
    // 2 эксперемент

    outputElement = document.getElementById('step-3-output');
    outputElement.innerHTML = '';
    paintElement = document.getElementById('step-3-paint');
    xGraphElement = document.getElementById('step-3-x-graph');
    yGraphElement = document.getElementById('step-3-y-graph');

    var _gx2 = DPH.reduce(_gx, document.getElementById('mx2').value);
    var _gy2 = DPH.reduce(_gy, document.getElementById('my2').value);

    log('Усеченные входные последовательности классификатора равны:<br>' +
        '<var>g&#770;<sub>v<sub>x</sub></sub></var> = ' + stringify(_gx2.filter(_gi => _gi !== 0)) + '<br>' +
        '<var>g&#770;<sub>v<sub>y</sub></sub></var> = ' + stringify(_gy2.filter(_gi => _gi !== 0))
    );

    var _x2 = DPH.decode(_gx2).map(round2);
    var _y2 = DPH.decode(_gy2).map(round2);

    log('Применяя формулу для усеченных последовательностей, получаем следующие оценки ' +
        '<var>x&#834;\'\'<sub>n</sub></var> и <var>y&#834;\'\'<sub>n</sub></var>:<br>' +
        '<var>x&#834;\'<sub>n</sub></var> = ' + stringify(_x2) + '<br>' +
        '<var>y&#834;\'<sub>n</sub></var> = ' + stringify(_y2)
    );

    _x2 = _x2.map(round);
    _y2 = _y2.map(round);

    log('После округления получаем значения координат <var>x\'\'<sub>n</sub></var> и <var>y\'\'<sub>n</sub></var>:<br>' + 
        '<var>x\'<sub>n</sub></var> = ' + stringify(_x2) + '<br>' +
        '<var>y\'<sub>n</sub></var> = ' + stringify(_y2)
    );

    log('Ошибка восстановления границ:<br>' + 
        '<var>&sigma;<sub>x</sub></var> = ' + round2(DPH.calcLosses(_x2, x), 2) + '<br>' +
        '<var>&sigma;<sub>y</sub></var> = ' + round2(DPH.calcLosses(_x2, x), 2)
    );

    drawFigure(paintElement, _x2, _y2);
    drawGraph(xGraphElement, _gx2.filter(_gi => _gi !== 0));
    drawGraph(yGraphElement, _gy2.filter(_gi => _gi !== 0));

    //----------------
    // 3 эксперемент

    outputElement = document.getElementById('step-4-output');
    outputElement.innerHTML = '';
    paintElement = document.getElementById('step-4-paint');
    xGraphElement = document.getElementById('step-4-x-graph');
    yGraphElement = document.getElementById('step-4-y-graph');

    var _gx3 = DPH.reduce(_gx, document.getElementById('mx3').value);
    var _gy3 = DPH.reduce(_gy, document.getElementById('my3').value);

    log('Усеченные входные последовательности классификатора равны:<br>' +
        '<var>g&#770;<sub>v<sub>x</sub></sub></var> = ' + stringify(_gx3.filter(_gi => _gi !== 0)) + '<br>' +
        '<var>g&#770;<sub>v<sub>y</sub></sub></var> = ' + stringify(_gy3.filter(_gi => _gi !== 0))
    );

    var _x3 = DPH.decode(_gx3).map(round2);
    var _y3 = DPH.decode(_gy3).map(round2);

    log('Применяя формулу для усеченных последовательностей, получаем следующие оценки ' +
        '<var>x&#834;\'\'<sub>n</sub></var> и <var>y&#834;\'\'<sub>n</sub></var>:<br>' +
        '<var>x&#834;\'<sub>n</sub></var> = ' + stringify(_x3) + '<br>' +
        '<var>y&#834;\'<sub>n</sub></var> = ' + stringify(_y3)
    );

    _x3 = _x3.map(round);
    _y3 = _y3.map(round);

    log('После округления получаем значения координат <var>x\'\'<sub>n</sub></var> и <var>y\'\'<sub>n</sub></var>:<br>' + 
        '<var>x\'<sub>n</sub></var> = ' + stringify(_x3) + '<br>' +
        '<var>y\'<sub>n</sub></var> = ' + stringify(_y3)
    );

    log('Ошибка восстановления границ:<br>' + 
        '<var>&sigma;<sub>x</sub></var> = ' + round2(DPH.calcLosses(_x3, x), 2) + '<br>' +
        '<var>&sigma;<sub>y</sub></var> = ' + round2(DPH.calcLosses(_x3, x), 2)
    );

    drawFigure(paintElement, _x3, _y3);
    drawGraph(xGraphElement, _gx3.filter(_gi => _gi !== 0));
    drawGraph(yGraphElement, _gy3.filter(_gi => _gi !== 0));
  };

  execute();

  document.getElementById('g').addEventListener('keyup', execute);

  document.getElementById('mx').addEventListener('keyup', execute);
  document.getElementById('my').addEventListener('keyup', execute);

  document.getElementById('mx2').addEventListener('keyup', execute);
  document.getElementById('my2').addEventListener('keyup', execute);

  document.getElementById('mx3').addEventListener('keyup', execute);
  document.getElementById('my3').addEventListener('keyup', execute);
}());