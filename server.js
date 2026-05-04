const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// 讓雲端伺服器能讀取當前資料夾的檔案
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let players = {}; 

io.on('connection', (socket) => {
    console.log('玩家連線:', socket.id);

    socket.on('ready', (data) => {
        players[socket.id] = { fleet: data.fleet, ready: true };
        const ids = Object.keys(players);
        // 當兩位玩家都準備好，通知遊戲開始，由第一位進攻
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

// 關鍵修改：支援雲端動態分配 Port
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`海戰伺服器已啟動！Port: ${PORT}`);
});