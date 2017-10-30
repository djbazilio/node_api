var ami = require('../GlobeModules/ami');
//var ami = new require('asterisk-manager')('5040','192.168.10.229','wc','wc78945612Qwe', true);

var conf = require('../../conf/conf');

function hangup (chanel, cb){
//cb(chanel)
    ami.action({
        'action': 'Command',
        'Command': "hangup request " + chanel,
    },cb)
}

var ring = new RegExp('Ring');
var dial = new RegExp('Dial');
var up = new RegExp('Up');
var response = 'Phone Not Found'
var n = new RegExp('\n');

function getChanel(phone, cb) {
    var strTest = new RegExp(phone);
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
                                    console.log(h)
                                    h = h.split("@webrtc")[0];
                                    response = h;
//                                    if(response) {
                                        cb(h);
 //                                   }
                                  //  response = false;
                                }catch(e){
                                    cb(e)
                                }
                            }
                        }
                    }
                }
            }
          //  console.log('Cicle is done!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
           // if(response) {
                cb(response)
           // }
        });
    }catch(e){
        cb( e)
    }
}

module.exports = (function() {
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
                }catch(e){ }
            }
            if(req.params.chanel) {
                var chanel = req.params.value + '/' + req.params.chanel;
                hangup(chanel, cb)
            }else if(req.params.value){
                getChanel(req.params.value, cb)
            }else{
                res.status(500).send('Wrong Phone!')
            }
        },
        getClientPhone: function (req, res) {
            getClientPhone(req.params.operatorname,function(e){
                try{
                    res.status(200).send(String(e))
                   // res.send(e)
                }catch(e){
                    //res.send(e)
                    console.log(e)
                }
            });
        }
    };
    return AmiService;
})();
