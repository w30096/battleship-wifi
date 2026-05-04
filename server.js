const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let players = {}; 

io.on('connection', (socket) => {
    console.log('連線成功:', socket.id);

    socket.on('ready', (data) => {
        players[socket.id] = { fleet: data.fleet, ready: true };
        const ids = Object.keys(players);
        if (ids.length === 2 && players[ids[0]].ready && players[ids[1]].ready) {
            io.emit('gameStart', ids[0]); 
        }
    });

    socket.on('attack', (data) => {
        socket.broadcast.emit('opp-attack', data);
    });

    socket.on('result', (data) => {
        socket.broadcast.emit('attack-result', data);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`伺服器運作中 Port: ${PORT}`);
});