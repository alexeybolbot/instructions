var express = require('express');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var router = express.Router();

var mail = require('../public/json/mail');
var connection = require('../public/javascripts/mysql');
var con = connection.Connection;

var transporter = nodemailer.createTransport({
    service: mail.service,
    auth: {
        user: mail.user,
        pass: mail.pass
    }
});

router.post('/saveStyle', function(req,res){
    req.session.style = req.body.timesOfDay;
    if(req.session.idUser){
        con.query('UPDATE user SET ? WHERE id = "'+req.body.id+'"', {style:req.body.timesOfDay}, function(err, result){
            req.session.save(); 
        });
    }
    else
        req.session.save();
    res.send(req.session.style);
});

router.post('/regist', function(req,res){   
    con.query('SELECT * FROM user WHERE email="'+req.body.email+'"', function(err, result) {
        if(result.length == 0){
            sendEmail(req);
            res.send(200);
        }
        else 
            res.send("passwordIsBusy");
    });
});

function sendEmail(req){
    var secretToken = randomstring.generate() + req.body.email;
    var url = "http://localhost:3000/verification/"+secretToken;

    var mailOptions = {
        from: mail.user,
        to: req.body.email,
        subject: 'Подтверждение регистрации',
        html: '<h1>Перейдите по ссылке, для завершения регистрации.</h1>\n\
              <p><a href="'+url+'">Подтвердить!!!</a></p>'
    };

    var obj = req.body;
    obj.status = 0;
    obj.secretToken  = secretToken;
    
    con.query('INSERT INTO user SET ?', obj, function(err, result) {});

    transporterSendMail(mailOptions);
        
};

function transporterSendMail(mailOptions){
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });    
};

module.exports = router;
