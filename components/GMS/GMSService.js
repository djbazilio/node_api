var request = require('request');
var path = require('path');
//============Params

var conf = require('../../conf/conf');

module.exports = (function() {
    function GSMService(req,res) { }
    GSMService.prototype = {
        test: function(req, res) {
            var options = {
                method: "GET",
                url: conf.gsm_url+conf.gsm_client_id
            };
            function callback(error, response, body) {
                if(!error){
                    if(body) {
                        res.send(body)
                    }else{
                        res.sendStatus(response.statusCode);
                    }
                }else{
                    res.send(error);
                }
            }
            request(options, callback);
        },
        status: function(req, res) {
            function callback(error, response, body) {
                if(!error){
                    if(body) {
                        res.status(response.statusCode).send(body)
                    }else{
                        res.sendStatus(response.statusCode);
                    }
                }else{
                    res.send(error);
                }
            }
            if(req.params.id) {
                var options = {
                    method: "GET",
                    url: conf.gsm_url_status + req.params.id+'/simple',
                    headers: {
                        'Authorization': 'Basic ' + new Buffer(conf.gsm_login + ":" + conf.gsm_pass).toString('base64')
                    }
                };
                request(options, callback);
            }else{
                res.status(400).send('error');
            }
        },
        send: function(req, res) {
            var json = new RegExp("application/json");
            var text = new RegExp("text/plain");
            var ct = req.get('Content-Type');
            var mes = false;
            if(json.test(ct)){
                mes = req.body;
            }else if(text.test(ct)){
                //console.log("=============================")
                //console.log(req.text)
                //console.log("=============================")
                try {
                    mes = JSON.parse(req.text);
                }catch(e){
                    res.status(400).send('Wrong JSON!');
                }
            }else{
                res.status(400).send('Content-Type not a application/json or text/plain');
            }
            if(mes) {
                var options = {
                    method: "POST",
                    url: conf.gsm_url+conf.gsm_client_id,
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': 'Basic ' + new Buffer(conf.gsm_login+":"+conf.gsm_pass).toString('base64')
                    },
                    json : mes
                };
                function callback(error, response, body) {
                    if(!error){
                        if(body) {
                            res.status(response.statusCode).send(body)
                        }else{
                            res.sendStatus(response.statusCode);
                        }
                    }else{
                        res.send(error);
                    }
                }
                request(options, callback);
            };
        }
    };
    return GSMService;
})();
