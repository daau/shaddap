var client = io();

// Elements
var roomsList = document.getElementById("roomsList")
var messageInput = document.getElementById("messageInput");
var roomNameInput = document.getElementById("roomNameInput");
var chatRoom = document.getElementById("chatRoom");
var chatBox = document.getElementById("chat");
var roomsRoom = document.getElementById("roomsRoom");
var addRoomForm = document.getElementById("addRoom");
var chatForm = document.getElementById("chatForm");

// Event listeners
chatForm.addEventListener("submit", sendMessage);
document.getElementById("leaveRoom").addEventListener("click", leaveRoom);
roomsList.addEventListener("click", joinRoom);
addRoomForm.addEventListener("submit", addRoom);

// Local vars
var username;
var roomID;

// Clientside socket events
client.on('login', function(data){
    var el = document.getElementById("username");
    el.innerHTML = `Logged in as ${data.username}`;
});

client.on('update users', function(data){
    var el = document.getElementById("users");
    el.innerHTML = `${data.usersCount} users currently online`;
});

client.on('send message', function(data){
    var message = data.message;
    var speaker = data.speaker;
    chatBox.innerHTML += `<div class="message-self"><span class="message-header">${speaker}</span><p class="message-contents">${message}</p></div>`
    chatBox.scrollTop = chatBox.scrollHeight;
});

client.on('receive message', function(data){
    var message = data.message;
    var speaker = data.speaker;
    chatBox.innerHTML += `<div class="message-other"><span class="message-header">${speaker}</span><p class="message-contents">${message}</p></div>`
    chatBox.scrollTop = chatBox.scrollHeight;
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
    chatRoom.style.display = "flex";
    roomsRoom.style.display = "none";
    addRoomForm.style.display = 'none';
});

client.on('leave room', function(data){
    roomID = '';
    chatRoom.style.display = "none";
    chatBox.innerHTML = '';
    roomsRoom.style.display = "block";
    addRoomForm.style.display = 'flex';
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
    client.emit('send message', {message: message});
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