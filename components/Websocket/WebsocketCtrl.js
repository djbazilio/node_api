var express  = require('express');
var router   = express.Router();

var Service  = require('./WebsocketService');

var service = new Service();

router.route('/:from/:to/:mess/:contactId?')
    .get(function(req, res){return service.get(req,res)});


module.exports = router;

