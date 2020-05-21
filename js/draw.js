(function(){
    var canvas=document.getElementById("canvas");
    var context=canvas.getContext("2d");

    var canvasOffset=canvas.getBoundingClientRect();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;


    var wt = canvas.width;
    var ht = canvas.height;
    var down = false;

    var lastX=-20;
    var lastY=-20;

    var points={};
    var convertedPoints = [];

    var stringify = function stringify(data) {
        return JSON.stringify(data)
            .replace(/^\[/, '{')
            .replace(/\]$/, '}')
            .replace(/\[/g, '(')
            .replace(/\]/g, ')')
            .replace(/,/g, ', ');
    };

    var printCoords = function(points) {
        convertedPoints = Object.keys(points).map(point => {
            point = point.split(',');
            return [parseInt(point[0]), parseInt(point[1])];
        });
        document.getElementById('result').value = stringify(
            convertedPoints
        );
        document.getElementById('resultN').innerHTML = '<var>N</var> = ' + Object.keys(points).length;
    };


    var doDPH = function doDPH() {
        resultContext.clearRect(0,0, resultCanvas.width, resultCanvas.height);

        // resultContext.fill();
        // grid(resultContext);

        var scaleValue = scaleSlider.value;

        var scale = 1 / (scaleSlider.max - parseFloat(scaleValue));
        console.log('SLIDER',scaleSlider.max === scaleSlider.value);
        var x = convertedPoints.map(point => point[0])
        var y = convertedPoints.map(point => point[1])

        console.log('x, y: ', x, y);

        var gx = x;
        var gy = y;

        console.log('gx, gy: ', x, y);

        gx = DPH.encode(gx);
        gy = DPH.encode(gy);

        var Nx = gx.filter(_x => _x > 0).length;
        var Ny = gy.filter(_y => _y > 0).length;

        context.clearRect(5, 5, 60, 25);
        context.fillStyle = "black";
        context.font = "10px Arial";
        context.fillText("Nx = " + Nx, 10, 15);
        context.fillText("Ny = " + Ny, 10, 25);

        var maxX = Math.max.apply(Math, gx.slice(1, -1).map(Math.abs));
        var maxY = Math.max.apply(Math, gy.slice(1, -1).map(Math.abs));

        console.log('MAXES: ', maxX, maxY);

        console.log('SCALE: ', scale, 'SCALE VALUE: ',scaleValue, 'SCALE MIN:', scaleSlider.min);

        if (scaleValue > scaleSlider.min) {
            gx = DPH.reduce(gx, maxX * scale);
            gy = DPH.reduce(gy, maxY * scale);
        }

        console.log('↓gx, ↓gx: ', gx.filter(x => x > 0), gy.filter(y => y > 0));

        var _x = DPH.decode(gx).map(x => Math.round10(x, 0));
        var _y = DPH.decode(gy).map(y => Math.round10(y, 0));

        console.log('~x, ~y: ', x, y);

        resultContext.fillStyle = "red";
        _x.forEach(function(_x, i) {
            resultContext.beginPath();
            resultContext.fillRect(_x * 5, _y[i] * 5, 5, 5);
        });

        var newNx = gx.filter(_x => _x > 0).length;
        var newNy = gy.filter(_y => _y > 0).length;

        resultContext.fillStyle = "black";
        resultContext.font = "10px Arial";
        resultContext.fillText("Nx = " + newNx, 10, 15);
        resultContext.fillText("Ny = " + newNy, 10, 25);
        resultContext.fillText("qx = " + DPH.calcLosses(_x, x), 10, 35);
        resultContext.fillText("qy = " + DPH.calcLosses(_y, y), 10, 45);
    };

    var draw = function (e) {};
    draw.started = false;
    var count;

    draw.ColorCell=function(x,y){
        var rw = x - 1;
        var rh = y - 1;
        rw = rw - rw % 5 + 0.5;
        rh = rh - rh % 5 + 0.5;

        var hashKey = Math.floor(rw / 5) + ',' + Math.floor(rh / 5);
        if (!points[hashKey]) {
            points[hashKey] = true;
        }

        context.fillStyle = "red";
        context.fillRect( rw, rh, 5, 5);
    };


    draw.single = function (e) {
        var mouseX=parseInt(e.clientX-offsetX);
        var mouseY=parseInt(e.clientY-offsetY);
        draw.ColorCell(mouseX,mouseY);
    };


    // mousemove
    draw.move = function (e) {

        if(!down){return;}

        // get the current mouse position
        var mouseX=parseInt(e.clientX-offsetX);
        var mouseY=parseInt(e.clientY-offsetY);

        // if we haven't moved off this XY, then don't bother processing further
        if(mouseX==lastX && mouseY==lastY){return;}

        // When running the for-loop below,
        // many iterations will not find a new grid-cell
        // so lastForX/lastForY will let us skip duplicate XY
        var lastForX=lastX;
        var lastForY=lastY;

        // walk along a line from the last mousemove position
        // to the current mousemove position.
        // Then color any cells we pass over on our walk
        for(var pct=0;pct<=1;pct+=0.06){
              var dx = mouseX-lastX;
              var dy = mouseY-lastY;
              var X = parseInt(lastX + dx*pct);
              var Y = parseInt(lastY + dy*pct);
              if( !(X==lastForX && Y==lastForY) ){ 
                  draw.ColorCell(X,Y); 
              }
              lastForX=X;
              lastForY=Y;
        }

        // set this mouse position as starting position for next mousemove
        lastX=mouseX;
        lastY=mouseY;    
    };


    // mousedown
    draw.start = function (e) {
        e.preventDefault();
        lastX=parseInt(e.clientX-offsetX);
        lastY=parseInt(e.clientY-offsetY);
        down = true;
    };


    // mouseup
    draw.stop = function (e) {
        e.preventDefault();
        printCoords(points);
        down = false;

        doDPH();100
    };


    function grid(context) {
        context.strokeStyle = "#f0f0f0";
        var h = 2.5;
        var p = 2.5;
        context.strokeRect(0.5, 0.5, 5, 5);
        for (i = 0; i < wt; i += p) {
            p *= 2;
            context.drawImage(canvas, p, 0);
        }
        for (i = 0; i < ht; i += h) {
            h *= 2;
            context.drawImage(canvas, 0, h);
        }
    }


    canvas.addEventListener('mouseup', draw.stop, false);
    canvas.addEventListener('mouseout', draw.stop, false);
    canvas.addEventListener('mousedown', draw.start, false);
    canvas.addEventListener('click', draw.single, false);
    canvas.addEventListener('mousemove', draw.move, false);

    grid(context);

    var resultCanvas=document.getElementById("resultCanvas");
    var resultContext=resultCanvas.getContext("2d");
    // grid(resultContext);

    var output = document.getElementById('output');
    var scaleSlider = document.getElementById('scale');
    
    scaleSlider.addEventListener('change', doDPH);

    var reding = false;
    scaleSlider.addEventListener('mousedown', function() {
        reading = true;
    });

    scaleSlider.addEventListener('mousemove', function() {
        if (reading && (Object.keys(points).length < 500)) {
            window.requestAnimationFrame(doDPH);
        }
    });

    document.addEventListener('mouseup', function () {
        reading = false;
    });
})(); // end $(function(){});