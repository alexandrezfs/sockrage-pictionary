var express = require('express');
var bodyParser = require('body-parser');
var app = module.exports.app = express();
var server = require('http').Server(app);

/**
 * App settings
 */
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Rendering Index
 */
app.route('/').get(function(req, res) {

    res.render('index');

});

/**
 * LISTEN SERVER
 */
server.listen(3003, function() {
    console.log("Server started");
});