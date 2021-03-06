var express = require('express');
var router = express.Router();

var connection = require('../public/javascripts/mysql');
var con = connection.Connection;

router.post('/', function(req, res, next) {
    var sql = tuningSqlScript(req);
    con.query(sql,function(err, result) {
        res.send(result);
    });   
});

function tuningSqlScript(req){
    if(req.body.hub == "all" && req.body.tab == "last")
        return "select * from instructions left join user on instructions.idUserFK = user.idUser ORDER BY instructions.date DESC LIMIT 10";
    else if(req.body.hub == "all" && req.body.tab == "best")
        return "select * from instructions left join user on instructions.idUserFK = user.idUser ORDER BY instructions.avRating DESC LIMIT 10";
    else if(req.body.hub == "tag" && req.body.tab == "last")
        return "select * from tags left join instructions on tags.idInstructionFK = instructions.idInstruction \n\
                left join user on instructions.idUserFK = user.idUser where tags.tag='"+req.body.name+"' ORDER BY instructions.date DESC LIMIT 10";
    else if(req.body.hub == "tag" && req.body.tab == "best")
        return "select * from tags left join instructions on tags.idInstructionFK = instructions.idInstruction \n\
                left join user on instructions.idUserFK = user.idUser where tags.tag='"+req.body.name+"' ORDER BY instructions.avRating DESC LIMIT 10";    
    else if(req.body.hub == "subject" && req.body.tab == "last")
        return "select * from instructions left join user on instructions.idUserFK = user.idUser \n\
                where instructions.subject='"+req.body.name+"' ORDER BY instructions.date DESC LIMIT 10";
    else if(req.body.hub == "subject" && req.body.tab == "last")
        return "select * from instructions left join user on instructions.idUserFK = user.idUser \n\
                where instructions.subject='"+req.body.name+"' ORDER BY instructions.avRating DESC LIMIT 10";    
}

router.post('/add', function(req, res, next) {  
    con.query('update user SET user.countInstructions=user.countInstructions+1 \n\
        where idUser="'+req.body.idUserFK+'"', function(err, result) {
    });    
    con.query('INSERT INTO instructions SET ?', req.body, function(err, result) {
        addTags(req.body, result.insertId, res);
    });
});

function addTags(obj, id, res){
    var tags = obj.tags.split(',');
    tags.forEach(function(item, i, tags) {
        con.query('INSERT INTO tags SET ?', {idInstructionFK: id, tag : item, idUserTagFK : obj.idUserFK}, function(err, result) {});
    });
    res.send(200);
}

router.get('/tags', function(req, res, next) {
    con.query('SELECT * FROM tags',function(err, result) {
        res.send(result);
    });
});

router.get("/getById/:id", function(req,res){
    con.query('select * from instructions left join user on instructions.idUserFK = user.idUser \n\
        where instructions.idInstruction="'+req.params.id+'"', function(err, result){
        res.send(result);
    });     
});

router.get("/getCommentsById/:id", function(req,res){
    con.query('select * from comments left join user on comments.idUserCommentsFK = user.idUser \n\
    join instructions on comments.idInsructionFK = instructions.idInstruction \n\
    where instructions.idInstruction="'+req.params.id+'" order by comments.dateComment', function(err, result){
        res.send(result);
    });     
});

router.post('/like', function(req, res, next) {
    con.query('select * from itransition.like where like.idCommentFK="'+req.body.idCommentFK+'" \n\
        and like.idUserLikeFK="'+req.body.idUserLikeFK+'"', function(err, result){
        if(result.length == 0)
            addLike(req, res);
        else
           deleteLike(req, res, result[0].idLike); 
    });     
});

function addLike(req, res){
    con.query('INSERT INTO itransition.like SET ?', req.body, function(err, result) {});
    con.query('update comments SET comments.countLike=comments.countLike+1 \n\
        where idComments="'+req.body.idCommentFK+'"', function(err, result) {
        getCountLike(req, res);
    });    
}

function deleteLike(req, res, idLike){
    con.query('delete from itransition.like where like.idLike="'+idLike+'"',function(err, result) {});
    con.query('update comments SET comments.countLike=comments.countLike-1 \n\
        where idComments="'+req.body.idCommentFK+'"', function(err, result) {
        getCountLike(req, res);
    });    
}

function getCountLike(req, res){
    con.query('select * from comments left join user on comments.idUserCommentsFK = user.idUser where comments.idComments="'+req.body.idCommentFK+'"', function(err, result){
        res.send(result[0]);
    });    
}

router.get('/getIkonLike/:id', function(req, res, next) {
    con.query('select * from comments left join user on comments.idUserCommentsFK = user.idUser \n\
        join instructions on comments.idInsructionFK = instructions.idInstruction \n\
        join itransition.like on comments.idComments = itransition.like.idCommentFK \n\
        where instructions.idInstruction="'+req.params.id+'"',function(err, result) {
        res.send(result);
    });
});

router.post('/rating', function(req, res, next) {
    con.query('INSERT INTO itransition.rating SET ?', req.body, function(err, result) {
        con.query('select * from itransition.rating left join instructions on \n\
            rating.idInstructionRatingFK = instructions.idInstruction where instructions.idInstruction = "'+req.body.idInstructionRatingFK+'"', function(err2, result2) {
            calculateAverageRating(result2, req, res);
        });
    });    
});

function calculateAverageRating(arr, req, res){
    var avRating = 0;
    arr.forEach(function(item, i, arr) {
        avRating += item.rating;
    });
    avRating = (avRating/arr.length).toFixed(1);
    con.query('UPDATE instructions SET ? WHERE idInstruction = "'+req.body.idInstructionRatingFK+'"', {avRating:avRating}, function(err, result) {
        res.send({avRating:avRating});
    });    
}

router.get('/getRating/:id', function(req, res, next) {
    con.query('select * from itransition.rating left join instructions on \n\
        rating.idInstructionRatingFK = instructions.idInstruction where instructions.idInstruction = "'+req.params.id+'"', function(err, result) {
        res.send(result);
    });
});

router.post('/delete', function(req, res, next) {
    con.query('delete from instructions where instructions.idInstruction="'+req.body.idInstruction+'"',function(err, result) {});
    con.query('update user SET user.countInstructions=user.countInstructions-1 \n\
        where idUser="'+req.body.idUser+'"', function(err, result) {
        res.send(200);
    });     
});

router.post('/update', function(req, res, next) {
    var obj = req.body;
    obj.date = new Date();
    con.query('UPDATE instructions SET ? WHERE instructions.idInstruction = "'+req.body.idInstruction+'"', obj, function(err, result){     
        updateTags(obj, res)
    });  
});

function updateTags(obj, res){
    con.query('delete from tags where tags.idInstructionFK="'+obj.idInstruction+'" and tags.idUserTagFK="'+obj.idUserFK+'"',function(err, result) {
        addTags(obj, obj.idInstruction, res);
    });
}

router.get('/getTagsByIdUser/:id', function(req, res, next) {
    con.query('select * from itransition.tags where tags.idUserTagFK = "'+req.params.id+'"', function(err, result) {
        res.send(result);
    });
});

module.exports = router;