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
        con.query('UPDATE user SET ? WHERE idUser = "'+req.body.id+'"', {style:req.body.timesOfDay}, function(err, result){
            req.session.save(); 
        });
    }
    else
        req.session.save();
    res.send(req.session.style);
});

router.post('/regist', function(req,res){   
    con.query('SELECT * FROM user WHERE email="'+req.body.email+'"', function(err, result) {
        if(result.length == 0)
            sendEmail(req, res);
        else 
            res.send("passwordIsBusy");
    });
});

function sendEmail(req, res){
    var secretToken = randomstring.generate() + req.body.email;
    var url = "http://localhost:3000/users/verification/"+secretToken;

    var mailOptions = {
        from: mail.user,
        to: req.body.email,
        subject: 'Confirmation of registration',
        html: '<h1>Follow the link to complete registration.</h1>\n\
               <h1>After that you will have to enter your login data.</h1>\n\
               <p><a href="'+url+'">Confirm!!!</a></p>'
    };

    var obj = req.body;
    obj.status = 0;
    obj.secretToken  = secretToken;

    transporterSendMail(res, mailOptions, obj);
        
};

function transporterSendMail(res, mailOptions, obj){
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            res.send(400);
        } else {
            con.query('INSERT INTO user SET ?', obj, function(err, result) {});
            res.send(200);
        }
    });    
};

router.get("/verification/:st", function(req,res){    
    con.query('UPDATE user SET ? WHERE secretToken = "'+req.params.st+'"', {status:2}, function(err, result){
        res.redirect('/authorization');      
    });     
});

router.post('/signIn', function(req, res) {     
    con.query('SELECT * FROM user WHERE email="'+req.body.email+'" and password="'+req.body.password+'"', function(err, result) {
        if(result.length != 0){
            if(result[0].status == 2)
                sessionSetup(req, res, result);            
            res.send(""+result[0].status);
        }else{
            res.send(400);
        };
    });
});

function sessionSetup(req, res, result){
    req.session.idUser = result[0].idUser;
    req.session.familyName = result[0].familyName;  
    req.session.email = result[0].email; 
    req.session.password = result[0].password; 
    req.session.photo = result[0].photo; 
    req.session.idSocial = result[0].idSocial;
    req.session.status = result[0].status;
    req.session.style = result[0].style;
    req.session.language = result[0].language;
    req.session.save();
};

module.exports = router;
