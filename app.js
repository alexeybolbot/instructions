var express = require('express');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');
var authorization = require('./routes/authorization');
var authSocial = require('./routes/authSocial');
var sessionActions = require('./routes/session');
var instruction = require('./routes/instruction');

var options = require('./public/javascripts/dbOptions');
var ac = require('./public/javascripts/addComment');
var addComment = ac.AddComment;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: new SessionStore(options.dbOptions)
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/authorization', authorization);
app.use('/authSocial', authSocial);
app.use('/session', sessionActions);
app.use('/instruction', instruction);

server.listen(80);

io.on('connection', function (socket) {
    socket.on('addComment', function (data) {
        addComment(data, io);
    });
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
