var socketio = require('socket.io');
var randomUsername = require('./usernames');
var generateID = require('./generateID')

let usersCount = 0;
let rooms = {};

const iolauncher = function(server){
    io = socketio.listen(server);

    io.on('connect', (socket) => {
        ++usersCount;
        socket.username = randomUsername();

        socket.emit('login', {
            username: socket.username
        });
        io.emit('update users', {
            usersCount: usersCount
        });

        socket.on('disconnect', () => {
            --usersCount;
            var roomID = socket.roomID;
            if (roomID) {
            rooms[roomID].usersCount -= 1;
                io.emit('update room population', {roomID: roomID, usersCount: rooms[roomID].usersCount});
            }
            socket.broadcast.emit('update users', {
                usersCount: usersCount
            });
        });

        socket.on('send message', (data) => {
            if (data.message && data.message.length > 0){
                io.to(socket.roomID).emit('send message', {message: data.message, speaker: socket.username})
            }
        });

        socket.on('join room', (data) => {
            if (!data.roomID) { return; }

            var roomID = data.roomID;
            socket.join(roomID);
            socket.roomID = roomID;

            io.to(roomID).emit('join room', {roomID: roomID});
            var usersCount = rooms[roomID].usersCount += 1;
            io.emit('update room population', {roomID: roomID, usersCount: usersCount});
        });

        socket.on('leave room', (data) => {
            if (!socket.roomID) { return; }

            var roomID = socket.roomID;
            socket.leave(roomID);
            socket.roomID = null;

            socket.emit('leave room', {message: `left room ${roomID}`});
            var usersCount = rooms[roomID].usersCount -= 1;
            io.emit('update room population', {roomID: roomID, usersCount: usersCount});
        })

        socket.on('add room', (data) => {
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
