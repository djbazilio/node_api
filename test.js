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

var ami = require('./components/GlobeModules/ami');
//var ami = new require('asterisk-manager')('5040','192.168.10.229','wc','wc78945612Qwe', true);

var ring = new RegExp('Ring');
var dial = new RegExp('Dial');
var up = new RegExp('Up');
var response = 'Phone Not Found'
var n = new RegExp('\n');

function hangup (chanel, cb){
    ami.action({
        'action': 'Command',
        'Command': "hangup request " + chanel,
    },cb)
}

function getChanel(phone, cb) {
    var strTest = new RegExp(phone);
    var getChanel = new RegExp('progressive');
    var local = new RegExp('Local');
    var h;
    var space;
    try {
        ami.action({
            'action': 'Command',
            'Command': 'core show channels concise',
        }, function (err, res) {
            if (n.test(res.content)) {
                space = res.content.split("\n")
            } else if(res.output) {
                space = res.output;
            }else{
                cb('Efire is null');
                space = 0;
            }
            for (var a = 0; a < space.length; a++) {
                if (ring.test(space[a]) || dial.test(space[a]) || up.test(space[a])) {
                    var channelArr = space[a].split("!")
                    for (var i = 0; i < channelArr.length; i++) {
                        if (strTest.test(channelArr[i])) {
                            if (local.test(channelArr[i])) {
                                h = channelArr[i];
                                response = false;
                                hangup(h, cb);
                            }
                        }
                    }
                }
            }
            if(response) {
                cb(response)
            }
        });
    }catch(e){
        cb(false, e)
    }
}


function getClientPhone(operatorname, cb) {
    var strTest = new RegExp(operatorname);
    var local = new RegExp('Local');
    var h;
    var space;
    try {
        ami.action({
            'action': 'Command',
            'Command': 'core show channels concise',
        }, function (err, res) {
            if (n.test(res.content)) {
                space = res.content.split("\n")
            } else if(res.output) {
                space = res.output;
            }else{
                cb('Efire is null');
                space = 0;
            }
            for (var a = 0; a < space.length; a++) {
                if (ring.test(space[a]) || dial.test(space[a]) || up.test(space[a])) {
                    var channelArr = space[a].split("!")
                    for (var i = 0; i < channelArr.length; i++) {
                        if (strTest.test(channelArr[i])) {
                            if (local.test(channelArr[i-1])) {
                                try {
                                    h = channelArr[i - 1].split("Local/")[1];
                                    h = h.split("@webrtc")[0];
                                    if(response) {
                                        cb({'phone': h});
                                    }
                                    response = false;
                                }catch(e){
                                    cb(e)
                                }
                            }
                        }
                    }
                }
            }
            if(response) {
                cb(response)
            }
        });
    }catch(e){
        cb( e)
    }
}

/*module.exports*/ var  hangup = (function() {
    function AmiService(req, res) {}
    AmiService.prototype = {
        hangup: function (req, res) {
            function cb(err, resp){
                try {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        res.send(resp)
                    }
                }catch(e){ console.log(e)}
            }
            getChanel(req.params.value, cb)
        },
        getClientPhone: function (req, res) {
            getClientPhone(req.params.operatorname,function(e){
                try{
                    res.send(e)
                }catch(e){
                    console.log(e)
                }
            });
        }
    };
    return AmiService;
})();

var t = new hangup()
app.get('/:operatorname', t.getClientPhone);


//===============================================


var apps = https.createServer({
    key: conf.ws_in_key,
    cert: conf.ws_in_cert
}, app ).listen('4432');
console.log('Example app listening on port 4432!')
//app.listen(3002, function () {
//    console.log('Example app listening on port 3002!')
//})
