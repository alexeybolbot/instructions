var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var router = express.Router();

var auth = require('../public/json/auth');
var connection = require('../public/javascripts/mysql');
var con = connection.Connection;

passport.use(new Strategy({
        consumerKey: auth.twitter.consumerKey,
        consumerSecret: auth.twitter.consumerSecret,
        callbackURL: auth.twitter.callbackURL      
    },
    function(token, tokenSecret, profile, cb) {
        return cb(null, profile);
    }
));

passport.use(new VKontakteStrategy({
        clientID:     auth.vk.clientID,
        clientSecret: auth.vk.clientSecret,
        callbackURL:  auth.vk.callbackURL
    },
    function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {
        return done(null, profile);
    }
));

passport.serializeUser(function(user, callback) {
    callback(null, user);
});

passport.deserializeUser(function(obj, callback) {
    callback(null,obj);
});

router.get('/twitter/login', passport.authenticate('twitter'));

router.get('/twitter/return', 
    passport.authenticate('twitter', { failureRedirect: '/error' }),
    function(req, res) {
        searchByIdSocial(req, res, req.user._json.id);
});

router.get('/auth/vkontakte', passport.authenticate('vkontakte'));

router.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', { failureRedirect: '/error' }),
    function(req, res) {
        searchByIdSocial(req, res, req.user._json.id);
});

function searchByIdSocial(req, res, idSocial){
    con.query('SELECT * FROM user WHERE idSocial="'+idSocial+'"', function(err, result) {
        if(result.length != 0) 
            sessionSetup(req, res, result);
        else
            insertUser(req, res);
    });    
}

function insertUser(req, res){
    var obj = {familyName:req.user.displayName,idSocial:req.user._json.id,photo:req.user.photos[0].value};
    con.query('INSERT INTO user SET ?', obj, function(err, result) {
        con.query('SELECT * FROM user WHERE idSocial="'+req.user._json.id+'"', function(err2, result2) { 
            sessionSetup(req, res, result2);
        });
    });    
}

function sessionSetup(req, res, result){
    req.session.idUser = result[0].id;
    req.session.familyName = result[0].familyName;  
    req.session.email = result[0].email; 
    req.session.password = result[0].password; 
    req.session.photo = result[0].photo; 
    req.session.idSocial = result[0].idSocial;
    req.session.status = result[0].status;
    req.session.style = result[0].style;
    req.session.language = result[0].language;
    req.session.save();
    res.redirect('/');
}

module.exports = router;
