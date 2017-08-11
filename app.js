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
let rooms = {};

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
    var roomID = socket.roomID
    if (roomID) {
      rooms[roomID].usersCount -= 1;
      io.emit('update room population', {roomID: roomID, usersCount: rooms[roomID].usersCount});
    }
    socket.broadcast.emit('update users', {
      usersCount: usersCount
    });
  });

  socket.on('send message', function(data){
    io.to(data.roomID).emit('send message', {message: data.message, speaker: data.speaker})
  });

  socket.on('join room', function(data){
    var roomID = data.roomID;
    socket.join(roomID);
    socket.roomID = roomID;
    io.to(roomID).emit('join room', {roomID: roomID, message: `you've joined room ${roomID}`});
    var usersCount = rooms[roomID].usersCount += 1;
    io.emit('update room population', {roomID: roomID, usersCount: usersCount});
  });

  socket.on('leave room', function(data){
    var roomID = data.roomID;
    socket.leave(roomID);
    socket.roomID = null;
    socket.emit('leave room', {message: `left room ${roomID}`});
    var usersCount = rooms[roomID].usersCount -= 1;
    io.emit('update room population', {roomID: roomID, usersCount: usersCount});
  })

  socket.on('add room', function(data){
    var roomID = generateID();
    rooms[roomID] = {roomName: data.roomName, usersCount: 0}
    io.emit('add room', {roomName: data.roomName, roomID: roomID});
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

app.use('/', function(req, res, next){
  req.rooms = rooms;
  next();
},
index);

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
