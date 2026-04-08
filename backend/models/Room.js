const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    code: { 
        type: String,
        required: true, 
        unique: true 
    },
    players: [{ token: String, socketId: String }],
    board: { 
        type: [String], 
        default: Array(42).fill(null) 
    },
    turn: { 
        type: String, 
        default: null 
    },
    status: { 
        type: String, 
        default: 'waiting' 
    } 
});

const Room = mongoose.model('room', RoomSchema);
module.exports = Room