var socketio = require('socket.io');
var randomUsername = require('./usernames');
var generateID = require('./generateID')

let usersCount = 0;
let rooms = {};

const iolauncher = function(server){
    io = socketio.listen(server);

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

    return io;
}

module.exports = {
    rooms,
    iolauncher
}
