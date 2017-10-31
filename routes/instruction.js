var express = require('express');
var router = express.Router();

var connection = require('../public/javascripts/mysql');
var con = connection.Connection;

router.post('/add', function(req, res, next) {
    con.query('INSERT INTO instructions SET ?', req.body, function(err, result) {
        addTags(req.body, result.insertId, res);
    });
});

function addTags(obj, id, res){
    var tags = obj.tags.split(',');
    tags.forEach(function(item, i, tags) {
        con.query('INSERT INTO tags SET ?', {idInstructionFK: id, tag : item}, function(err, result) {});
    });
    res.send(200);
}

router.get('/tags', function(req, res, next) {
    con.query('SELECT * FROM tags',function(err, result) {
        res.send(result);
    });
});

module.exports = router;