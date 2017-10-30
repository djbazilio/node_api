var express  = require('express');
var router   = express.Router();

var Service  = require('./GMSService');

var service = new Service();

router.route('/test')
    .get(function(req, res){return service.test(req,res)});
router.route('/send')
    .post(function(req, res){return service.send(req,res)});
router.route('/status/:id')
    .get(function(req, res){return service.status(req,res)});

module.exports = router;

// window =  require('jsdom').jsdom().defaultView;