var xmpp = require('node-xmpp');
var Stanza = require('node-xmpp-core').Stanza
var sys = require("sys");

var conf = require('../../conf/conf');


function send(param, to, mess)
{
    var jabber = new xmpp.Client(param);

    jabber.on('online', function () {
        var message = new Stanza('message', {to: to, type: 'chat'});
        message.c('body').t(mess);
        setTimeout(function() {
            jabber.send(message);
        }, 1000)
    });
    jabber.on('error', function (e) {
        sys.puts(e);
    });
}


module.exports = (function() {
    function HangoutsService(req, res) {}
    HangoutsService.prototype = {
        get: function (req, res) {
            var param = {
                jid: req.params.from,
                password: req.params.pass,
                host: conf.hang_host,
                port: conf.hang_port
            }

            send(param, req.params.to, req.params.mess);


            var response = 'Send to:' + req.params.to
            try {
                res.send(response);
            } catch (e) {
                //console.log(e)
            }

        },
        post: function (req, res) {
            var json = new RegExp("application/json");
            var text = new RegExp("text/plain");
            var ct = req.get('Content-Type');
            var mes = false;
            if (json.test(ct)) {
                mes = req.body;
            } else if (text.test(ct)) {
                try {
                    mes = JSON.parse(req.text);
                } catch (e) {
                    res.status(400).send('Wrong JSON!');
                }
            } else {
                res.status(400).send('Content-Type not a application/json or text/plain');
            }
            if (mes) {
                var param = {
                    jid: mes.from,
                    password: mes.pass,
                    host: conf.hang_host,
                    port: conf.hang_port
                }

                send(param, mes.to, mes.mess);


                var response = 'Send to:' + mes.to
                try {
                    res.send(response);
                } catch (e) {
                    //console.log(e)
                }
            }
        }
    }
    return HangoutsService;
})()