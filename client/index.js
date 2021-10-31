const sendMessageButton = document.getElementById('send-message');
const sendUsernameButton = document.getElementById('send-username');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const listContainer = document.getElementById('online-users-list');
const messagesContainer = document.getElementById('messages-list');
const ws = new WebSocket('ws://localhost:5000/');

let currentUser = {}

ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch(data.type){
        case 'connection': {
            updateOnlineUsersUI(data);
            break;
        }
        case 'message': {
            updateMessagesListUI(data);
            break;
        }
        case 'clients': {
            displayOnlineUsersUI(data.clients);
            break;
        }
        default:
            break;
    }
};

sendUsernameButton.onclick = () => {
    if(usernameInput.value !== ""){
        currentUser = {
            id: (+new Date).toString(16),
            date: new Date(),
            userName: usernameInput.value,
            type: 'connection'
        }
        ws.send(JSON.stringify(currentUser));
        usernameInput.value = "";
        document.getElementById('popup').style.display = 'none';
    }
}
sendMessageButton.onclick = () => {
    const message = {
        message: messageInput.value,
        id: currentUser.id,
        date: new Date(),
        userName: currentUser.userName,
        type: 'message'
    }
    ws.send(JSON.stringify(message));
    updateMessagesListUI(message);
    messageInput.value = "";
}
const displayOnlineUsersUI = (users) => {
    const keys = Object.keys(users);
    let htmlItems = "";
    
    keys.forEach(key => {
        const isMe = (key == currentUser.id)? "<span> (You) </span>": ""
        htmlItems += `<li>${users[key].userName}${isMe}</li>`;
    })
    listContainer.innerHTML = htmlItems;
}

const updateOnlineUsersUI = (user) => {
    let htmlItems = `<li>${user.userName}</li>`;
    listContainer.innerHTML += htmlItems;
}

const updateMessagesListUI = (msg) => {
    const currentClass = (msg.id == currentUser.id)? "current": "";
    const htmlItems = `<div class="message-container ${currentClass}">
        <div class="message-avatar">
            <figure>${msg.userName.slice(0,1)}</figure>
        </div>
        <div class="message-body">
            <h5 class="message-sender">${msg.userName}</h5>
            <div class="message-text">${msg.message}</div>
            <div class="message-date">${new Date(msg.date).toLocaleString()}</div>
        </div>
    </div>`;
    messagesContainer.innerHTML += htmlItems;
}