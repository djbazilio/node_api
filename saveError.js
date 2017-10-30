var express = require('express')
var https   = require('https')
var app = express()
var bodyParser   = require('body-parser');
var busboy       = require('connect-busboy'); //middleware for form/file upload

var conf = require('./conf/conf');

app.use(busboy());
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
//=====================================

var request = require('request');
var fs          = require('fs');
var maps        = '/usr/maps';
var dir         = '/usr/maps';



var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'cde3$RFV',
    database : 'logs'
});

//
//function insert(value) {
//    var date = new Date();
//    var rd = value.ErrorDetail;
//    var e = value.Error;
//    var ip = new RegExp("192.168.14");
//    try {
//        rd = rd.replace("'", "");
//        rd = rd.replace("'", "");
//        e = e.replace("'", "");
//        e = e.replace("'", "");
//    }catch(e){
//        console.log(e)
//    }
//    if(ip.test(value.IP)) {
//        date = date.getUTCFullYear() + '-' +
//            ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
//            ('00' + date.getUTCDate()).slice(-2) + ' ' +
//            ('00' +(date.getUTCHours()+3)).slice(-2) + ':' +
//            ('00' + date.getUTCMinutes()).slice(-2) + ':' +
//            ('00' + date.getUTCSeconds()).slice(-2);
//        var sql = "INSERT INTO from_crm (user, api, ip, date, Error, ErrorDetail) " +
//            "VALUES ('" + value.User + "', " +
//            "'" + value.API + "'," +
//            "'" + value.IP + "'," +
//            "'" + date + "'," +
//            "'" + e + "'," +
//            "'" + rd + "')";
//        console.log(sql)
//        connection.query(sql, function (err, result) {
//            if (err) throw err;
//            console.log("1 record inserted");
//        });
//    }else{
//        return false;
//    }
//}
//
//
//
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
connection.connect();
//
//
//var test =  (function() {
//    function CallbackService(req, res) {}
//    CallbackService.prototype = {
//        saveError: function (req, res) {
//            var mess = false;
//            try {
//                mess = JSON.parse(JSON.stringify(req.body));
//                mess.IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//            }
//            catch(e){
//                console.log(e)
//            }
//            if(mess){
//                insert(mess);
//            }
//            res.send();
//        },
//        getErrorList: function (req, res) {
//            connection.query("SELECT * FROM logs.from_crm ORDER BY id DESC LIMIT 100;", function (err, result) {
//                if (err) {
//                    res.send(err);
//                    throw err;
//                }else{
//                    var resp = '<table><tr>' +
//                        '<td>id</td>' +
//                        '<td>OperatorName</td>' +
//                        '<td>api</td>' +
//                        '<td>ip</td>' +
//                        '<td>date</td>' +
//                        '<td>Error</td>' +
//                        '<td>ErrorDetail</td></tr>';
//                    for(var i=0;i<result.length;i++){
//                        resp = resp + '<tr><td>'+result[i].id+
//                            '</td><td>'+result[i].user+
//                            '</td><td>'+result[i].api+
//                            '</td><td>'+result[i].ip+
//                            '</td><td>'+result[i].date+
//                            '</td><td>'+result[i].Error+
//                            '</td><td>'+result[i].ErrorDetail+'</td></tr>'
//                    }
//                    resp = resp + '</table>'
//                    res.send(resp);
//                }
//            });
//        }
//    };
//    return CallbackService;
//})();
//
//var t = new test();
//app.post('/*', t.saveError);
//app.get('/', t.getErrorList);

function insert(ip, login, browser, cb) {
        connection.query("SELECT * FROM logs.browser WHERE IP='"+ip+"'", function (err, result) {
            if (err) {
                cb(err);
                throw err;
            }else{
                if(result.length>0) {
                    cb(result)
                }else {
                    var date = new Date();
                    var sql = "INSERT INTO browser (Ver, IP, EditDate, Operator) " +
                        "VALUES ('" + browser + "', " +
                        "'" + ip + "'," +
                        "'" + date + "'," +
                        "'" + login + "')";
                    //console.log(sql)
                    connection.query(sql, function (err, result) {
                        if (err) {
                            cb(err);
                            throw err;
                        } else {
                            cb(result);
                        }
                    })
                }
            }
        })
}


var test =  (function() {
    function CallbackService(req, res) {}
    CallbackService.prototype = {
        getErrorList: function (req, res) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var browser = req.headers['user-agent'];
            try {
                if(parseInt((browser.split('Chrome/')[1]).split('.0.')[0])>46) {
                    insert(ip, req.params.login, req.headers['user-agent'], function (e) {
                        res.send(e);
                    })
                }else{
                    res.send('OK');
                }
            }catch(e){
                res.send(e);
            }
        }
    };
    return CallbackService;
})();

var t = new test();
app.get('/:login', t.getErrorList);
//===============================================


var apps = https.createServer({
    key: conf.ws_in_key,
    cert: conf.ws_in_cert
}, app ).listen('4432');
console.log('Example app listening on port 4432!')
//app.listen(3002, function () {
//    console.log('Example app listening on port 3002!')
//})
