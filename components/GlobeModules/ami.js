var conf = require('../../conf/conf');
var ami = new require('asterisk-manager')(
    conf.ami_port,
    conf.ami_host,
    conf.ami_user,
    conf.ami_pass,
    true
)
ami.keepConnected();
module.exports = ami;