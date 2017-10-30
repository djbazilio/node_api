var express  = require('express');
var router   = express.Router();

var Service  = require('./NotificationService');

var service = new Service();

router.route('/')
    .get(function(req, res){return service.get(req,res)})
    .post(function(req, res){return service.post(req,res)})

module.exports = router;

