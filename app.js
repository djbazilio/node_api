var compression = require('compression');
var express      = require('express');

var logger       = require('morgan');
var bodyParser   = require('body-parser');
var busboy       = require('connect-busboy'); //middleware for form/file upload

//var expressSession = require('express-session');
//var ws          = require('./server/ws/ws');

var route        = require('./route');

var app = express();

app.use(compression());

//app.use(express.static(app.root + '/app/public', { maxAge: 86400000 }));

app.use(busboy());

app.use(logger('dev'));
app.use(bodyParser.json());

app.use(function(req, res, next){
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){ req.text += chunk });
        req.on('end', next);
    } else {
        next();
    }
});


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://192.168.10.10');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(function(req,res,next) {
    console.log("/" + req.method);
    next();
});

app.use("/api",route);

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}

app.use(haltOnTimedout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(req.originalUrl+"<<<<<<<==");
    var err = new Error('Not Found');
    //res.redirect('/login');
    err.status = 404;
    next(err);
});


app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

