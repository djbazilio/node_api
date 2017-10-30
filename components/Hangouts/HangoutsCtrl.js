var express  = require('express');
var router   = express.Router();

var Service  = require('./HangoutsService');

var service = new Service();

router.route('/:to/:mess/:from/:pass')
    .get(function(req, res){return service.get(req,res)});
router.route('/')
    .post(function(req, res){return service.post(req,res)});


module.exports = router;

