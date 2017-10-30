var express  = require('express');
var router   = express.Router();

var Service  = require('./ZKAccessService');

var service = new Service();

router.route('/')
    .get(function(req, res){return service.get(req,res)});


module.exports = router;

