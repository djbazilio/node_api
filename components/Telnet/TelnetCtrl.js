var express  = require('express');
var router   = express.Router();

var Service  = require('./TelnetService');

var service = new Service();

router.route('/:id1/:id2/:id3/:ip?')
    .get(function(req, res){return service.get(req,res)});

module.exports = router;

// window =  require('jsdom').jsdom().defaultView;