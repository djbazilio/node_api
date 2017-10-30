var ami = require('../GlobeModules/ami');
var conf = require('../../conf/conf');

function hangup (chanel, cb){
    ami.action({
        'action': 'Command',
        'Command': "hangup request " + chanel,
    },cb)
}


function getChanel(login){
    try {
        var strTest = new RegExp(login);
        var local = new RegExp('SIP');
        var h;
        var space;
        ami.action({
            'action': 'Command',
            'Command': 'core show channels concise',
        }, function (err, res) {
            try {
                space = res.content.split("\n")
                for (var a = 0; a < space.length; a++) {
                    var channelArr = space[a].split("!")
                    for (var i = 0; i < channelArr.length; i++) {
                        if (strTest.test(channelArr[i])) {
                            if (local.test(channelArr[i])) {
                                h = space[a].split("!")[0];
                                ami.action({
                                    'action': 'Command',
                                    'Command': "hangup request " + h
                                }, function (err, res) {
                                })
                            }
                        }
                    }
                }
            }catch(e){
                console.log(e);
            }
        });
    }catch(e){
        console.log(e);
    }
}

module.exports = (function() {
    function CallLimitsService(req, res) {}
    CallLimitsService.prototype = {
        hangup: function (req, res) {
            getChanel(req.params.login);
            res.send(req.params.login);
        }
    };
    return CallLimitsService;
})();