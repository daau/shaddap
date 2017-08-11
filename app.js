var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var randomUsername = require('./helpers/usernames');
var generateID = require('./helpers/generateID')

let usersCount = 0;
let channels = {};

// Socket logic
io.on('connect', function(socket){
  ++usersCount;
  socket.username = randomUsername();
  socket.emit('login', {
    username: socket.username
  });

  io.emit('update users', {
    usersCount: usersCount
  });

  socket.on('disconnect', function(){
    --usersCount;
    socket.broadcast.emit('update users', {
      usersCount: usersCount
    });
  });

  socket.on('send message', function(data){
    io.emit('send message', {message: data.message, speaker: data.speaker})
  });

  socket.on('join room', function(data){
    var identifier = data.identifier;
    socket.join(identifier);
    console.log(`user joined the room ${identifier}`);
    io.to(identifier).emit('room message', {message: `you've joined room ${identifier}`});
  });

  socket.on('leave room', function(data){
    // Unsubscribe the user from the socket room
  })

  socket.on('add room', function(data){
    var identifier = generateID();
    channels[identifier] = {roomName: data.roomName}
    console.log(channels);
    io.emit('add room', {roomName: data.roomName, identifier: identifier});

    // Create a new socket room
  });

});

// Need to remove any empty rooms after 2 minutes or so...
// setInterval(() => {console.log("hey")}, 1000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, server};
