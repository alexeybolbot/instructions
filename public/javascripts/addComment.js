var connection = require('../javascripts/mysql');
var con = connection.Connection;

var addComment = function(data, socket){
    con.query('update instructions SET instructions.countComments=instructions.countComments+1 \n\
        where idInstruction="'+data.idInsructionFK+'"', function(err, result) {
    });
    con.query('INSERT INTO comments SET ?', data, function(err, result) {
        if(result)
            getCommentsById(result.insertId, socket);
    });    
}

function getCommentsById(id, io){
    con.query('select * from comments left join user on comments.idUserCommentsFK = user.idUser \n\
    where comments.idComments="'+id+'"', function(err, result){
        io.sockets.emit('comment', result[0]);
    });
}

exports.AddComment = addComment;