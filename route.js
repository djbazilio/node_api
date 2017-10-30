var express         = require('express');

var app = express();

var telnet      = require('./components/Telnet/TelnetCtrl');
var gms         = require('./components/GMS/GMSCtrl');
var progress    = require('./components/Progress/ProgressCtrl');
var callback    = require('./components/Callback/CallbackCtrl');
var hangouts    = require('./components/Hangouts/HangoutsCtrl');
var ws          = require('./components/Websocket/WebsocketCtrl');
var notification= require('./components/Notification/NotificationCtrl');
var maps        = require('./components/Maps/MapsCtrl');
var ami         = require('./components/Ami/AmiCtrl');
var predial     = require('./components/PreDial/PreDialCtrl');
var aster       = require('./components/CallLimits/CallLimitsCtrl');
var zkaccess    = require('./components/ZKAccess/ZKAccessCtrl');

app.use('/telnet', telnet);
app.use('/gms', gms);
app.use('/progress', progress);
app.use('/callback', callback);
app.use('/hangouts', hangouts);
app.use('/ws', ws);
app.use('/notification', notification);
app.use('/maps', maps);
app.use('/ami', ami);
app.use('/predial', predial);
app.use('/aster', aster);
app.use('/zkaccess', zkaccess);

module.exports = app;
