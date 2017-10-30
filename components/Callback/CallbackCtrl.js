var express  = require('express');
var router   = express.Router();

var Service  = require('./CallbackService');

var service = new Service();

router.route('/:phone1/:phone2?')
    .get(function(req, res){return service.get(req,res)});


module.exports = router;

