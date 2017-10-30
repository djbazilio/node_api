var express  = require('express');
var router   = express.Router();

var Service  = require('./MapsService');

var service = new Service();

router.route('/directions')
    .post(function(req, res){return service.dir(req,res)});
router.route('/geocoding')
    .post(function(req, res){return service.geo(req,res)});
router.route('/img/*')
    .get(function(req, res){return service.img(req,res)});


module.exports = router;

