var express  = require('express');
var router   = express.Router();

var Service  = require('./AmiService');

var service = new Service();

router.route('/hangup/:value/:chanel?')
    .get(function(req, res){return service.hangup(req,res)});
router.route('/getphone/:operatorname')
    .get(function(req, res){return service.getClientPhone(req,res)});

module.exports = router;

