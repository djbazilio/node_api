var express  = require('express');
var router   = express.Router();

var Service  = require('./CallLimitsService');

var service = new Service();

router.route('/operator/:login')
    .get(function(req, res){return service.hangup(req,res)});


module.exports = router;

