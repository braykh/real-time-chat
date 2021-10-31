const express = require('express');
const app = express();
const WSserver = require('express-ws')(app);
const wss = WSserver.getWss();
const PORT = process.env.PORT || 5000;
const onlineClients = {
    type: 'clients',
    clients: {}
}

app.ws('/', (ws, req) => {
    console.log("connected");
    ws.on('message', (message) => {
        message = JSON.parse(message);
        switch(message.type){
            case 'connection': {
                connectionHendler(ws, message);
                break;
            }
            case 'message': {
                messageHendler(ws, message);
                break;
            }
            default:
                break;
        }
    });
    ws.on('close', () => {
        delete onlineClients.clients[ws.id];
        updateClients(ws);
    });
});



const connectionHendler = (ws, msg) => {
    ws.id = msg.id;
    onlineClients.clients[msg.id] = msg;
    wss.clients.forEach(client => {
        if(client !== ws){
            client.send(JSON.stringify(msg));
        }
    });
    if(onlineClients.clients){
        ws.send(JSON.stringify(onlineClients));
    }
}
const updateClients = (ws) => {
    wss.clients.forEach(client => {
        if(client !== ws ){
            client.send(JSON.stringify(onlineClients));
        }
    });
}

const messageHendler = (ws, msg) => {
    wss.clients.forEach(client => {
        if(client.id !== msg.id){
            client.send(JSON.stringify(msg));
        }
    })
}


app.listen(PORT, () => {
    console.log(`app run on port: ${PORT}`);
});