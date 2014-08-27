/**
 * GLOBAL VARS
 */
var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

var sockRagePictionary = null;
var canvasId = null;
var browserId = null;

/**
 * INIT CANVAS
 */
function initPictionary(sockrage_addr, db_name) {

    /**
     * INIT SOCKRAGE SYNCHRONIZER
     * @type {SockRage}
     */
    sockRagePictionary = new SockRage(sockrage_addr, db_name);

    /**
     * Default color is black
     */
    $("#black").css('border', '2px solid #CCC');

    /**
     * Canvas configuration
     * @type {HTMLElement}
     */
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    /**
     * MOUSE LISTENERS
     */
    canvas.addEventListener("mousemove", function (e) {

        findxy('move', e);

        if(flag) {

            sockRagePictionary.broadcast('drawing-line', {
                partnerColor : x,
                partnerLineWidth : y,
                partnerPrevX : prevX,
                partnerPrevY : prevY,
                partnerCurrX : currX,
                partnerCurrY : currY
            });

        }

    }, false);

    canvas.addEventListener("mousedown", function (e) {

        findxy('down', e);

        if(flag) {

            sockRagePictionary.broadcast('drawing-point', {
                partnerColor : x,
                partnerLineWidth : y,
                partnerCurrX : currX,
                partnerCurrY : currY
            });

        }

    }, false);

    canvas.addEventListener("mouseup", function (e) {

        findxy('up', e);

    }, false);

    canvas.addEventListener("mouseout", function (e) {

        findxy('out', e);

    }, false);


    /**
     * SOCKRAGE LSITENER - DRAW A LINE WHEN ONE RECEIVED
     */
    sockRagePictionary.on('drawing-line', function(data) {

        drawPartner(data.partnerColor,
            data.partnerLineWidth,
            data.partnerPrevX,
            data.partnerPrevY,
            data.partnerCurrX,
            data.partnerCurrY);

    });

    /**
     * SOCKRAGE LISTENER - DRAW A POINT WHEN ONE RECEIVED
     */
    sockRagePictionary.on('drawing-point', function(data) {

        drawPoint(data.partnerColor, data.partnerCurrX, data.partnerCurrY);

    });

    /**
     * SOCKRAGE LSITENER - UPDATE CANVAS WHEN ARRIVING
     */
    sockRagePictionary.on('getById', function(data) {

        if(data.img_uri != null && (data.browser_id != browserId) || browserId == null) {
            updateCanvas(data.img_uri);
            browserId = Math.random();
        }

    });


    /**
     * SOCKRAGE LSITENER - CLEAR PANEL WHEN SOMEONE DOES IT
     */
    sockRagePictionary.on('clear-panel', function(data) {

        clear();

    });

    /**
     * SOCKRAGE LISTENER - REGISTER CANVAS IF NOT EXISTS, IF EXISTS GET CANVAS ID FOR FURTHER UPDATES
     */
    sockRagePictionary.on('getAll', function(data) {

        if(data[0] != null) {

            canvasId = data[0]._id;
            sockRagePictionary.get(canvasId);

            setInterval(function() {
                save(); //update image every second
            }, 1000);

        }
        else {
            sockRagePictionary.set({
                img_uri : null,
                author : null,
                browser_id : null
            });

            sockRagePictionary.list();
        }
    });

    sockRagePictionary.list();

}

/**
 * COLOR FN
 * @param obj
 */
function color(obj) {

    var colors = ['green', 'blue', 'red', 'yellow', 'orange', 'black', 'white'];

    for(var i = 0; i < colors.length; i++) {

        $("#" + colors[i]).css('border', 'none');

        if(colors[i] == 'white') {
            $("#" + colors[i]).css('border', '2px dotted #000000');
        }
    }

    $("#" + obj.id).css('border', '2px solid #CCC');

    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;
}

/**
 * DRAWING SOMETHING ON THE CANVAS
 */
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

/**
 * DRAWING SOMETHING ON THE CANVAS - FROM SOCKET
 */
function drawPartner(partnerColor, partnerLineWidth, partnerPrevX, partnerPrevY, partnerCurrX, partnerCurrY) {

    ctx.beginPath();
    ctx.moveTo(partnerPrevX, partnerPrevY);
    ctx.lineTo(partnerCurrX, partnerCurrY);
    ctx.strokeStyle = partnerColor;
    ctx.lineWidth = partnerLineWidth;
    ctx.stroke();
    ctx.closePath();

}

/**
 * DRAW A POINT ON THE PANEL
 * @param color
 * @param currX
 * @param currY
 */
function drawPoint(color, currX, currY) {

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(currX, currY, 2, 2);
    ctx.closePath();
    dot_flag = false;

}

/**
 * CLEAR PANEL FN
 */
function erase() {
    var m = confirm("Want to clear the panel area ?");
    if (m) {
        clear();

        sockRagePictionary.broadcast('clear-panel', {});
    }
}

function clear() {

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.closePath();

}

/**
 * SAVE IMAGE ON LIVE SERVER
 */
function save() {

    var dataURL = canvas.toDataURL();

    sockRagePictionary.update(canvasId, {
        img_uri : dataURL,
        author : username,
        browser_id : browserId
    });

}

/**
 * UPDATE THE CANVAS
 * @param dataURL
 */
function updateCanvas(dataURL) {

    var img = new Image;

    img.onload = function(){
        ctx.drawImage(img,0,0); // Or at whatever offset you like
    };

    img.src = dataURL;
}

/**
 * FIND MOUSE POSITION
 * @param res
 * @param e
 */
function findxy(res, e) {

    if (res == 'down') {

        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;

        if (dot_flag) {
            drawPoint(x, currX, currY);
            dot_flag = false;
        }

    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {

        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }

}