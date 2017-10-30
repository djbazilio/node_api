#!/usr/bin/env node
const conf = require('./conf/conf');

var bodyParser   = require('body-parser');



var app = require('./app');

var http = require('http');
var https = require('https');

var port = normalizePort(process.env.PORT ||  conf.port);
app.set('port', port);

var server = http.createServer(app);



var apps = https.createServer({
    key: conf.ws_in_key,
    cert: conf.ws_in_cert
}, app ).listen(conf.port_ssl);


server.listen(port, function () {
    console.log('API Port '+port);
    console.log('API SSL Port '+conf.port_ssl);
    console.log('WS Port '+conf.ws_port);
    console.log('WSS Port '+conf.ws_ssl_port);
});


server.timeout = 30000;
server.on('error', onError);
server.on('listening', onListening);


function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
}

