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

var sockRagePictionary = new SockRage("http://localhost:3000", "pictionary");
var canvasId = null;


/**
 * INIT CANVAS
 */
function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);



    /**
     * SOCKRAGE LISTENERS
     */
    sockRagePictionary.on('update', function(data) {

        console.log(data);

        sockRagePictionary.get(canvasId);

    });

    sockRagePictionary.on('getById', function(data) {

        console.log(data);

        if(data.img_uri != null) {
            updateCanvas(data.img_uri);
        }

    });

    sockRagePictionary.on('getAll', function(data) {
        console.log(data);

        if(data[0] != null) {
            canvasId = data[0]._id;
            sockRagePictionary.get(canvasId);
        }
        else {
            sockRagePictionary.set({
                img_uri : null,
                author : null
            });
        }
    });

    sockRagePictionary.list();

}

/**
 * COLOR FN
 * @param obj
 */
function color(obj) {
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

    save();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
    }
}

/**
 * SAVE IMAGE ON LIVE SERVER
 */
function save() {

    var dataURL = canvas.toDataURL();

    sockRagePictionary.update(canvasId, {
        img_uri : dataURL,
        author : username
    });

}

/**
 * UPDATE THE CANVAS
 * @param dataURL
 */
function updateCanvas(dataURL) {

    console.log("update IMG !");

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
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
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