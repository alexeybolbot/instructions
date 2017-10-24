var express = require('express');
var router = express.Router();

router.get('/exit', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

router.get('/getSession', function(req,res){    
    res.send(req.session); 
});

router.post('/rememberMe', function(req, res) {
    req.session.cookie.maxAge = 14 * 24 * 3600000;
    req.session.save();
    res.send('200');
}); 

module.exports = router;
