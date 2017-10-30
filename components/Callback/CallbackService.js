var ami = require('../GlobeModules/ami');
var sql = require('../GlobeModules/mssql');

var conf = require('../../conf/conf');

var request = new sql.Request();

var exten;

function sendCall(phone1,exten, cb){
    request.query("exec TELESHOP.dbo.sipGetQueuesipmany @phone='"+phone1+"',@accountcodeout='"+exten+"'").then(function (recordset) {
        if(recordset.length){
            request.query("exec TELESHOP.dbo.sipGetContactID @phone='"+phone1+"',@accountcode='"+exten+"',@sip='"+recordset[0].sip+"'").then(function (res) {
                if(res.length) {
                    setTimeout(function(){
                        var channel = 'Local/'+phone1+'@webrtc';
                        ami.action({
                            'action'	:'Originate',
                            'channel'	: channel,
                            'context'	:'autoanswer',
                            'exten' 	: exten,
                            'account' 	: exten,
                            'callerid'	: res[0].IDCONTACT+' <'+phone1+'>',
                            'async' 	: true,
                            'priority'	: 1
                        }, function(err, res) {
                            if(err){
                                cb(err);
                            }else if(res){
                                cb(res);
                            }
                        });
                    }, 5000)
                }
            }).catch(cb)
        }
    })
}

module.exports = (function() {
    function CallbackService(req, res) {}
    CallbackService.prototype = {
        get: function (req, res) {
            if(req.params.phone2){
                exten = req.params.phone2
            }else{
                exten = conf.cb_def_number;
            }
            var err = new RegExp('Error');
            var cb = function(e){
                try {
                    if (err.test(e)) {
                        res.status(500).send(String(e))
                    } else {
                        res.status(200).send(e)
                    }
                }
                catch(e){
                    //console.log(e)
                }
            }
            sendCall(req.params.phone1, exten, cb)
        }
    }
    return CallbackService;
})()