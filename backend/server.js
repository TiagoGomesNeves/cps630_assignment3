const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const http = require('http');
const server =require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: 'http://localhost:5173' }
});


const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

const PORT = 8080;
const DATABASE_HOST = 'localhost';
const DATABASE_PORT = 27017;

app.use(cors());

const dbURL = `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/gamesDB`;
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', function(e) {
  console.log('connection error:' + e);
  process.exit(1); 
});

db.once('open', function () {
  console.log("Database connected!");
});


function checkWin(board) {
    const rows = 6, cols = 7;
    const get = (r, c) => board[r * cols + c];

    // Horizontal
    for (let r = 0; r < rows; r++)
        for (let c = 0; c <= cols - 4; c++)
            if (get(r,c) && get(r,c) === get(r,c+1) && get(r,c) === get(r,c+2) && get(r,c) === get(r,c+3))
                return get(r,c);

    // Vertical
    for (let r = 0; r <= rows - 4; r++)
        for (let c = 0; c < cols; c++)
            if (get(r,c) && get(r,c) === get(r+1,c) && get(r,c) === get(r+2,c) && get(r,c) === get(r+3,c))
                return get(r,c);

    // Diagonal down-right
    for (let r = 0; r <= rows - 4; r++)
        for (let c = 0; c <= cols - 4; c++)
            if (get(r,c) && get(r,c) === get(r+1,c+1) && get(r,c) === get(r+2,c+2) && get(r,c) === get(r+3,c+3))
                return get(r,c);

    // Diagonal down-left
    for (let r = 0; r <= rows - 4; r++)
        for (let c = 3; c < cols; c++)
            if (get(r,c) && get(r,c) === get(r+1,c-1) && get(r,c) === get(r+2,c-2) && get(r,c) === get(r+3,c-3))
                return get(r,c);

    return null;
}

async function updateGameStats(room, winnerToken = null, isDraw = false) {
    if (!room || !room.players || room.players.length < 2) {
        return;
    }

    const player1Token = room.players[0].token;
    const player2Token = room.players[1].token;

    if (isDraw) {
        await User.updateOne(
            { token: player1Token },
            { $inc: { draws: 1 } }
        );

        await User.updateOne(
            { token: player2Token },
            { $inc: { draws: 1 } }
        );

        return;
    }

    const loserToken = player1Token === winnerToken ? player2Token : player1Token;

    await User.updateOne(
        { token: winnerToken },
        { $inc: { wins: 1 } }
    );

    await User.updateOne(
        { token: loserToken },
        { $inc: { losses: 1 } }
    );
}

// For Socket.io 
io.on('connection', (socket) => {
    console.log('User connected at: ', socket.id);

    socket.on('createRoom', async ({token}) =>{
        const code = crypto.randomUUID().substring(0,6).toUpperCase();
        const room = new Room({
            code: code,
            players: [{ token: token, socketId: socket.id }],
            board: Array(42).fill(null),
            turn: null,
            status: 'waiting'
        });

        await room.save();
        socket.join(code);
        socket.emit('roomCreated', { code });
    });


    socket.on('joinRoom', async ({token, code}) =>{
        const room = await Room.findOne({code: code});

        if (!room){
            return socket.emit('error', {message: "Room Not Found"});
        }
        if (room.players.length >= 2){
            return socket.emit('error', {message: 'Room is Full'});
        }

        if(room.players.find(p => p.token === token)){
            return socket.emit('error', {message: 'Already in Room'});
        }

        room.players.push({token: token, socketId: socket.id});
        room.turn = room.players[0].token;
        room.status = 'active';
        await room.save();

        socket.join(code);
        io.to(code).emit('gameStart', { code, turn: room.turn });
    });

    socket.on('rejoinRoom', async ({ token, code }) => {
        const cleanedCode = code.trim().toUpperCase();
        const room = await Room.findOne({ code: cleanedCode });

        if (!room) {
            return socket.emit('error', { message: 'Room not found' });
        }

        const playerIndex = room.players.findIndex((p) => p.token === token);

        if (playerIndex === -1) {
            return socket.emit('error', { message: 'You are not part of this room' });
        }

        room.players[playerIndex].socketId = socket.id;
        await room.save();

        socket.join(cleanedCode);

        const winnerPiece = checkWin(room.board);
        let winner = null;

        if (winnerPiece === 'R') {
            winner = room.players[0]?.token || null;
        } else if (winnerPiece === 'Y') {
            winner = room.players[1]?.token || null;
        }

        socket.emit('roomState', {
            code: room.code,
            board: room.board,
            turn: room.turn,
            status: room.status,
            winner: winner
        });
    });

    socket.on('disconnect', () =>{
        console.log('User Disconnected: ', socket.id);
    });

    socket.on('makeMove', async ({ code, token, column }) => {
        if (!Number.isInteger(column) || column < 0 || column > 6) {
            return socket.emit('error', { message: 'Invalid column' });
        }

        const room = await Room.findOne({ code });
        if (!room) return socket.emit('error', { message: 'Room not found' });
        if (room.status !== 'active') return socket.emit('error', { message: 'Game not active' });
        if (room.turn !== token) return socket.emit('error', { message: 'Not your turn' });
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (!room.board[r * 7 + column]) {
                row = r;
                break;
            }
        }
        if (row === -1) return socket.emit('error', { message: 'Column is full' });

        const piece = room.players[0].token === token ? 'R' : 'Y';
        room.board[row * 7 + column] = piece;

        
        const winner = checkWin(room.board);
        if (winner) {
            room.status = 'finished';
            await room.save();
            await updateGameStats(room, token, false);
            return io.to(code).emit('gameOver', { winner: token, board: room.board });
        }

        if (room.board.every(cell => cell !== null)) {
            room.status = 'finished';
            await room.save();
            await updateGameStats(room, null, true);
            return io.to(code).emit('gameOver', { winner: null, board: room.board });
        }

        room.turn = room.players.find(p => p.token !== token).token;
        await room.save();
        io.to(code).emit('moveMade', { board: room.board, turn: room.turn });
    });

    socket.on('forfeitGame', async ({ code, token }) => {
        const room = await Room.findOne({ code });

        if (!room) {
            return socket.emit('error', { message: 'Room not found' });
        }

        if (room.status !== 'active') {
            return socket.emit('error', { message: 'Game not active' });
        }

        const forfeitingPlayer = room.players.find(p => p.token === token);
        if (!forfeitingPlayer) {
            return socket.emit('error', { message: 'You are not part of this room' });
        }

        const winnerPlayer = room.players.find(p => p.token !== token);
        if (!winnerPlayer) {
            return socket.emit('error', { message: 'Opponent not found' });
        }

        room.status = 'finished';
        await room.save();
        await updateGameStats(room, winnerPlayer.token, false);

        io.to(code).emit('gameOver', {
            winner: winnerPlayer.token,
            board: room.board,
            forfeitedBy: token
        });
    });

    socket.on('sendMessage', ({ code, token, message }) => {
        io.to(code).emit('newMessage', { token, message });
    });

});

// Authorization middleware used to protect routes must be placed in all api's
async function requireAuth(req, res, next){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: "Authorization Header missing"})
    }

    const token = authHeader.substring(7);
    const user = await User.findOne({token: token});

    if(!user){
        return res.status(401).json({error: 'Invalid Token'});
    }
    // If user is needed
    req.user = user;
    next();

};

// Login used to login the user and retrieve the users token
app.post('/api/auth/login', express.json(), async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password){
        return res.status(400).json({error: 'Username and Password are required'});
    }

    const user = await User.findOne({username: username});
    if (!user){
        return res.status(401).json({error: "Error With Username or Password"});
    }

    const matched = await bcrypt.compare(password, user.password);
    if(!matched){
        return res.status(401).json({error: "Error With Username or Password"});
    }

    return res.status(200).json({token: user.token});
});

// Signup used to create an user account and create a token for the user
app.post('/api/auth/signup', express.json(), async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password){
        return res.status(400).json({error: 'Username and Password are required'});
    }

    const user = await User.findOne({username: username});
    if (user){
        return res.status(409).json({error: "Username already Exists"});
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomUUID();

    const newUser = new User({
        username: username,
        password: hashed,
        token: token,
        wins: 0,
        losses: 0,
        draws: 0
    });

    await newUser.save()
            .then(savedUser => {
                res.status(201).json({token: savedUser.token});
            })
            .catch(err => {
                console.error("Error saving book:", err);
                res.status(500).json({ error: "Internal server error" });
            });
});



server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));