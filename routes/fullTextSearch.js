var express = require('express');
var router = express.Router();

var elasticsearch = require('elasticsearch');
var client = elasticsearch.Client({
    host: 'localhost:9200'
});


router.post('/', function(req, res, next) {
    client.search({
        index: 'test',
        type: 'post',
        body: {
            query: {
                simple_query_string: {
                    query: req.body.text,
                    fields: [
                        "textcomment^3",
                        "text^2",
                        "heading"
                    ]
                }
            }    
        }
    }).then(function(response) {
        var hits = response.hits.hits;
        res.send(hits);
    }, function(error) {
        console.trace(error.message);
    });
});

module.exports = router;
