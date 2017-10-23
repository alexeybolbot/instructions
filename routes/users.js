var express = require('express');
var router = express.Router();

var connection = require('../public/javascripts/mysql');
var con = connection.Connection;

router.post('/saveStyle', function(req,res){
    req.session.style = req.body.timesOfDay;
    con.query('UPDATE user SET ? WHERE id = "'+req.body.id+'"', {style:req.body.timesOfDay}, function(err, result){
        req.session.save(); 
    });
    res.send(req.session.style);
});

module.exports = router;
