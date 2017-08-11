var client = io();

// Elements
var roomsList = document.getElementById("roomsList")
var messageInput = document.getElementById("messageInput");
var roomNameInput = document.getElementById("roomNameInput");
var chatRoom = document.getElementById("chatRoom");
var chatBox = document.getElementById("chat");
var roomsRoom = document.getElementById("roomsRoom");
var addRoomForm = document.getElementById("addRoom")

// Event listeners
document.getElementById("input").addEventListener("submit", sendMessage);
document.getElementById("leaveRoom").addEventListener("click", leaveRoom);
roomsList.addEventListener("click", joinRoom);
addRoomForm.addEventListener("submit", addRoom);


// Local vars
var username;
var roomID;

// Clientside socket events
client.on('login', function(data){
    username = data.username;
    var el = document.getElementById("username");
    el.innerHTML = `Logged in as ${username}`;
});

client.on('update users', function(data){
    var usersCount = data.usersCount;
    var el = document.getElementById("users");
    el.innerHTML = `${usersCount} users currently online`;
});

client.on('send message', function(data){
    var message = data.message;
    var speaker = data.speaker;
    chatBox.innerHTML += `<p>${speaker}: ${message}</p>`
});

client.on('add room', function(data){
    roomsList.innerHTML += (
        `<div class="room">
            <a href="#" data-id="${data.roomID}">${data.roomName}</a>
            <span>0 users</span>
        </div>`
    )
});

client.on('join room', function(data){
    roomID = data.roomID;
    chatRoom.style.display = "block";
    roomsRoom.style.display = "none";
    addRoomForm.style.display = 'none';
});

client.on('leave room', function(data){
    roomID = '';
    chatRoom.style.display = "none";
    chatBox.innerHTML = '';
    roomsRoom.style.display = "block";
    addRoomForm.dispaly = 'block';
});

client.on('update room population', function(data){
    var el = document.querySelectorAll(`[data-id="${data.roomID}"`)[0];
    var countEl = el.nextElementSibling;
    countEl.innerHTML = `${data.usersCount} users`
});

// Functions
function leaveRoom(event){
    event.preventDefault();
    client.emit('leave room', {roomID: roomID});
}

function sendMessage(event){
    event.preventDefault();
    var message = messageInput.value;
    messageInput.value = '';
    client.emit('send message', {message: message, speaker: username, roomID: roomID});
}

function addRoom(event){
    event.preventDefault();
    var roomName = roomNameInput.value;
    roomNameInput.value = '';
    client.emit('add room', {roomName: roomName});
}

function joinRoom(event){
    event.preventDefault();
    if (event.target.tagName != 'A') return;
    client.emit('join room', {roomID: event.target.dataset.id});
}