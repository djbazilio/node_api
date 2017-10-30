var SMSPDU  = require('./sms-pdu');
var net     = require( "net" );
var utf8    = require('utf8');

var conf = require('../../conf/conf');

module.exports = (function() {
    function TelnetService() { }
    TelnetService.prototype ={
        get: function(req, res) {
            var inputl;
            function auth(str) {
                if (str.indexOf('login') != -1) {
                    socket.write(conf.telnetUser + '\r\n')
                } else if (str.indexOf('Password') != -1) {
                    socket.write(conf.telnetPass + '\r\n');
                }
            }


            function events(str) {
                var resp = '';
                if (str.indexOf('OK') != -1) {
                        socket.write('at&g' + req.params.id1 + '=AT+CMG' + req.params.id2 + '=' + req.params.id3 + '\r\n');
                        inputl = inputl + 1;
                } else if (str.indexOf('ERROR') != -1) {
                    socket.end();
                    return str;
                } else if (str.indexOf('079') != -1) {
                    try {
                        var upd = str.split('g' + req.params.id1);
                        upd[1] = upd[1].trim().replace('\r\n', '');
                        var r = '';
                        var ans = SMSPDU.decode(upd[1])
                        var text;
                        if (ans[11]) {
                            text = ans[11];
                        } else {
                            text = ans[9]
                        }
                        r = '<html><head><meta charset="utf-8"></head><body><p>' + ans[3] + '</p><p>' + ans[7] + '</p><p>' + text + '</p></body></html>';
                        socket.end();
                        return r;
                    }
                    catch(e){
                        return e;
                    }
                } else if(str.indexOf('g' + req.params.id1 != -1)) {
                    resp = resp + str;
                }
                if (inputl > 1) {
                    socket.end()
                    return resp;
                }
            }

            var host = conf.telnetHost;
            if(req.params.ip){
                host = req.params.ip;
            }
            var socket = net.connect(conf.telnetPort, host, function () {
                socket.setTimeout(2000, socket.destroy);
                inputl = 0;
                socket.on("data", function (data) {
                    var str = data.toString();
                    auth(str);
                    var resulr = events(str);
                    var html = new RegExp('html');
                    if(resulr) {
                        try {
                            if(html.test(resulr)) {
                                res.writeHead(202, {"Content-Type": "text"});
                                res.write(resulr);
                            }else{
                                res.send('null')
                            }
                            res.end();
                        }
                        catch(e){
                            //console.log(e)
                        }
                    }
                })
            })

            socket.on("error", function (err) {
                console.log("Error");
                console.log(err);
                try {
                    res.writeHead(404)
                    res.end();
                }
                catch(e){
                   // console.log(e)
                }
            })
        }
    }
    return TelnetService;
})();