var conf = require('../../conf/conf');
var request = require('request');


var options = {
    url: 'http://192.168.10.5:8080/accounts/login/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'username=honin&password=honin2015&template9=&finnger10=&finnger9=&template10=&login_type=pwd&client_language=en'
};


function updateAccess(cb){
    function callback(error, response) {
        if(!error){
            try {
                var cookieBAD = response.headers['set-cookie'][0];
                var cookie = cookieBAD.split("; Path=/")[0];

                var optionsUpdate = {
                    url: 'http://192.168.10.5:8080/data/iclock/Device/_op_/Syncdata/?&K=2',
                    method: 'POST',
                    headers: {
                        'Content-Type'  : 'application/x-www-form-urlencoded',
                        'Cookie'        : cookie
                    }
                };
                request(optionsUpdate, function (error, response, body) {
                    if(!error) {
                        console.log(response.statusCode)
                        console.log(body)
                        cb(body)
                    }else{
                        console.log('Error', error);
                        cb(error)
                    }
                });
            }catch(e){
                console.log('Error',e)
                cb(e)
            }
        }else{
            console.log('Error', error);
            cb(error)
        }
    }

    request(options, callback);
}
module.exports = (function() {
    function CallbackService(req, res) {}
    CallbackService.prototype = {
        get: function (req, res) {
            updateAccess(function(r){
                res.send(r)
            });
           // res.status(200).send('ZKAccess Update!')
        }
    };
    return CallbackService;
})();