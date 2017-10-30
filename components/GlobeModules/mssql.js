var sql = require('mssql');
var conf = require('../../conf/conf');

var config = {
    user	: conf.db_user,
    password: conf.db_pass,
    server  : conf.db_host,
    database: conf.db_name
}
sql.connect(config).then(function() {
    console.log('MSSQL connected');
})
module.exports = sql