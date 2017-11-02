var connection = require('../javascripts/mysql');
var con = connection.Connection;

var addComment = function(data, socket){
    con.query('INSERT INTO comments SET ?', data, function(err, result) {
        if(result)
            getCommentsById(result.insertId, socket);
    });    
}

function getCommentsById(id, io){
    con.query('select * from comments left join user on comments.idUserFK = user.idUser \n\
    where comments.idComments="'+id+'"', function(err, result){
        io.sockets.emit('comment', result[0]);
    });
}

exports.AddComment = addComment;