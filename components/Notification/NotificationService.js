var request = require('request');

var conf = require('../../conf/conf');

var data = {};
module.exports = (function() {
    function NotificationService(req, res) {}
    NotificationService.prototype = {
        get: function (req, res) {
            res.send(data)
        },
        post: function (req, res) {
            var json = new RegExp("application/json");
            var text = new RegExp("text/plain");
            var ct = req.get('Content-Type');
            var mes = false;
            if(json.test(ct)){
                mes = req.body;
            }else if(text.test(ct)){
                try {
                    mes = JSON.parse(req.text);
                }catch(e){
                    res.status(400).send('Wrong JSON!');
                }
            }else{
                res.status(400).send('Content-Type not a application/json or text/plain');
            }
            if(mes) {
                data = {
                    title   : mes.title,
                    text    : mes.text,
                    url     : mes.url,
                    img     : mes.img
                }
                var options = {
                    method: "POST",
                    url: conf.notif_url,
                    headers: {
                        'Authorization':conf.notif_auth
                    },
                    json : {"to" : mes.to}
                };
                function callback(error, response) {
                    if(!error){
                        res.send(response.statusMessage)
                    }else{
                        res.send(error)
                    }
                }
                request(options, callback);
            }
        }
    }


    return NotificationService;
})()