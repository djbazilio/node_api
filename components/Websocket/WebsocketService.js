var fs = require('fs'),
    groupBy = require('lodash.groupby'),
    request = require('request'),
    utf8    = require('utf8'),
    http    = require('http'),
    https    = require('https');
var WebSocketServer   = require('ws').Server;
var ami = require('../GlobeModules/ami');

var Model = require('./UserModel');
var conf  = require('../../conf/conf');

var m = new Model();
var processRequest = function( req, res ) {
    res.writeHead(200);
    res.end("All glory to WebSockets!\n");
};

var app = http.createServer( processRequest ).listen( conf.ws_port );

var apps = https.createServer({
    key: conf.ws_in_key,
    cert: conf.ws_in_cert
}, processRequest ).listen( conf.ws_ssl_port);

var ws = new WebSocketServer( { server: app } );
var wss = new WebSocketServer( { server: apps } );

var OnlineUsers = [];
function userLogOut(user){
	console.log(user)
	/*
    request({method: "POST",
        "rejectUnauthorized": false,
        "url": conf.ws_logiot_host+'/api/contacts/-3/'+user.UserID,
        "headers" : {"UserHash": user.PasswordHash, "Content-Type": "application/json; charset=utf-8"},
    },function (error, response, body) {
        //console.log(error)
       // console.log( response.statusCode )
        //console.log(body)
    });
    request({method: "POST",
        "rejectUnauthorized": false,
        "url": conf.ws_logiot_host+'/api/UserTypes/',
        "headers" : {"UserHash": user.PasswordHash+"+logout", "Content-Type": "application/json; charset=utf-8"},
    })*/
}

function SendMess(mess, id){
    if(allUsers.Users&&allUsers.Users[id]) {
        try {
            allUsers.Users[id].ws.send(JSON.stringify(mess))
        } catch (e) {
            delete allUsers.Users[id];
            console.log('Error', allUsers.Users[id])
        }
    }
}

function sendStatus(mess){
    try {
        if (mess) {
            var tarr = {};
            var t = allUsers.UserTypeID[mess.str.UserTypeID];
            for (var i in t) {
                if(t[i]){
                    tarr[i] = t[i]
                }
            }
            var p = allUsers.ParantUser[mess.str.ParantUser];
            for (var i in p) {
                if(p[i]){
                    tarr[i] = p[i]
                }
            }
            var s = {'18':allUsers.UserStatusID[18]}
            for (var j in s) {
                for (var i in s[j]) {
                    if (s[j][i]) {
                        tarr[i] = s[j][i]
                    }
                }
            }

            for (var i in tarr) {
                if(i){
                    SendMess(mess, i)
                }
            }
        }
    }catch(e){
        console.log(e)
    }
}
var allUsers = false;

function timer(){
    if(allUsers){
        var callUsers = [];
        for(var j in allUsers.Users){
            var u = m.get(allUsers.Users[j])
            callUsers.push(u)
        }
        var send = {
            action : 'updateUsers',
            str    : callUsers
        }
    }
    for(var i in allUsers.Users){
        if(allUsers.Users[i].CallAdmin){
           // console.log(allUsers.Users[i].Operatorname)
            SendMess(send, allUsers.Users[i].UserID)
        }
    }
    //console.log('============send')
    setTimeout(timer, 1000);
}
timer();

function WebSockets(wsConnect){
    wsConnect.on( 'message', function ( message ) {
        var a = JSON.parse(message)
        if(a.action){
            var user = m.get(a.str);
            switch(a.action) {
                case 'join':

                    if(!allUsers){
                        allUsers = {
                            'UserStatusID':{},
                            'UserTypeID':{},
                            'ParantUser':{},
                            'Users':{}
                        }
                    }
                    if(!allUsers.UserTypeID[user.UserTypeID]){
                        allUsers.UserTypeID[user.UserTypeID] ={};
                    }
                    allUsers.UserTypeID[user.UserTypeID][user.UserID] = user.CallAdmin
                    if(!allUsers.UserStatusID[user.UserStatusID]){
                        allUsers.UserStatusID[user.UserStatusID] ={};
                    }
                    allUsers.UserStatusID[user.UserStatusID][user.UserID] = user.CallAdmin
                    if(!allUsers.ParantUser[user.ParantUser]){
                        allUsers.ParantUser[user.ParantUser] ={};
                    }
                    allUsers.ParantUser[user.ParantUser][user.UserID] = user.CallAdmin

                    user.ws = wsConnect;
                    user.SocetID = wsConnect.upgradeReq.headers['sec-websocket-key'];
                    user.ip = wsConnect.upgradeReq.headers['x-forwarded-for'] || wsConnect.upgradeReq.connection.remoteAddress;
                    allUsers.Users[user.UserID] = user;

                    if(user.CallAdmin){
                        var callUsers = [];
                        for(var j in allUsers.Users){
                            var u = m.get(allUsers.Users[j])
                            callUsers.push(u)
                        }
                        var send = {
                            action : 'updateCallUsers',
                            str    : callUsers
                        }
                    }

                    SendMess(send, user.UserID)
                    break;
                case 'call':
                    if(user){
                        var cuser = m.get(user);
                        var send = {
                            action : 'updateUsers',
                            str    : cuser
                        }
                        try {
                            allUsers.Users[user.UserID].CallStatus = cuser.CallStatus;
                            //sendStatus(send)
                        }catch(e){
                            try {
                                allUsers.Users[user.UserID] = user;
                            }
                            catch(e){}
                        }
                    }
                    break;
                case 'message':
                    var msg =  a.str;
                    var sendTo = msg.nameTo;
                    var send = {
                        action : 'message',
                        str    : msg
                    }
                    if(sendTo.UserStatusID){
                        for(var i=0;i<allUsers.Users.length;i++){
                            if(message.UserStatusID == allUsers.Users[i].UserStatusID){
                                SendMess(send, allUsers.Users[i].UserID)
                            }
                        }
                    }else if(sendTo.UserID){
                        SendMess(send, sendTo.UserID)
                    }else if(sendTo.ToUserParent){
                        for(var i in allUsers.Users){
                            if(sendTo.ToUserParent == allUsers.Users[i].ParantUser){
                                send.str.nameFrom = -sendTo.ToUserParent;
                                SendMess(send, allUsers.Users[i].UserID)
                            }
                        }
                    }else if(sendTo.ToUserType){
                        for(var i in allUsers.Users){
                            if(sendTo.ToUserType == allUsers.Users[i].UserTypeID){
                                SendMess(send, allUsers.Users[i].UserID)
                            }
                        }
                    }
                    break;
            }
        }
    });
    wsConnect.on( 'close', function ( request ) {
        if(OnlineUsers.length>0){
            for(var i in allUsers.Users){
                if(allUsers.Users[i].SocetID==wsConnect.upgradeReq.headers['sec-websocket-key']){
                    allUsers.Users[i].CallStatus = 'Вышел';
                    var send = {
                        action : 'updateUsers',
                        str    : m.get(allUsers.Users[i])
                    }
                    sendStatus(send)
					setTimeout(function(){
						userLogOut(m.get(allUsers.Users[i]))
					}, 10000);
                    delete allUsers.Users[i];
                }
            }
        }
    })
}
wss.on( 'connection', function ( wsConnect ) {
    WebSockets(wsConnect);
});
ws.on( 'connection', function ( wsConnect ) {
    WebSockets(wsConnect);
});
module.exports = (function() {
    function WebsocketService(req, res) {}
    WebsocketService.prototype = {
        get: function (req, res) {
            if(req.params.contactId) {
                var mess = {
                    message: req.params.mess,
                    nameFrom: req.params.contactId,
                    nameTo: {UserID: req.params.to}
                }
                var send = {
                    action: 'command',
                    str: mess
                }
            }else{
                var mess = {
                    message: req.params.mess,
                    nameFrom: req.params.from,
                    nameTo: {UserID: req.params.to}
                }
                var send = {
                    action: 'message',
                    str: mess
                }
            }
            SendMess(send, req.params.to)
            //  if(req.params.phone2){
            res.send('Users Online :' + Object.keys(OnlineUsers).length);
        }
    }
    return WebsocketService;
})()