var conf = require('../../conf/conf');
var request = require('request');
var fs          = require('fs');
var maps        = '/usr/maps';
var dir         = '/usr/maps';


module.exports = (function() {
    function CallbackService(req, res) {}
    CallbackService.prototype = {
        dir: function (req, res) {
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
                var options = {
                    method: "GET",
                    url: conf.maps_url_dir+'origin='+mes.from+'&destination='+mes.to+'&'+conf.notif_auth
                };

                function callback(error, response, body) {
                    if (!error) {
                        if (body) {
                            res.status(response.statusCode).send(body)
                        } else {
                            res.sendStatus(response.statusCode);
                        }
                    } else {
                        res.send(error);
                    }
                }

                request(options, callback);
            }else{
                res.status(400).send('Wrong JSON!');
            }
        },
        geo: function (req, res) {
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
                var options = {
                    method: "GET",
                    url: conf.maps_url_geo+encodeURI(mes.addr)+'&'+conf.notif_auth
                };
                function callback(error, response, body) {
                    if (!error) {
                        if (body) {
                            res.status(response.statusCode).send(body)
                        } else {
                            res.sendStatus(response.statusCode);
                        }
                    } else {
                        res.send(error);
                    }
                }

                request(options, callback);
            }else{
                res.status(400).send('Wrong JSON!');
            }
        },
        img: function (req, res) {
            try{
                req.originalUrl = (req.originalUrl).replace("api/maps/img/", "");
            }catch(e){
                console.log(e)
            }
            var download = function(uri, filename, cb){
                request.head(uri, function(err, res, body){
                    var dl = filename.split("/");
                    for(var i = 1; i<dl.length-1;i++){
                        dir = dir + '/'+dl[i];
                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);
                        }
                        if(i==dl.length-2){
                            dir= maps;
                            request({
                                url: uri,
                                timeout: 30000
                            }, function(error, response, body) {
                                if(response.statusCode==200){
                                    setTimeout(function() {
                                        cb(maps + filename);
                                    }, 100)
                                }
                            }).pipe(fs.createWriteStream(maps+filename))
                        }
                    }
                });
            };
           function callback(file) {
               if (!res.getHeader('Cache-Control') || !res.getHeader('Expires')) {
                   res.setHeader("Cache-Control", "public, max-age=345600"); // ex. 4 days in seconds.
                   res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());  // in ms.
               }
               res.header('Content-type', 'image/png');
               res.end(fs.readFileSync(file));
           }
           if(!fs.existsSync(maps+req.originalUrl)) {
               try {
                   download('http://a.tile.openstreetmap.org/' + req.originalUrl, req.originalUrl, callback);
               }
               catch (e) {
                   res.end(400)
               }
           }else{
               callback(maps+req.originalUrl)
           }
        }
    }
    return CallbackService;
})()