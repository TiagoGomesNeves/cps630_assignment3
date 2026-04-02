const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username :{
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        unique: false,
        trim: true,
        required: true
    },
    token:{
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    wins: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
    losses: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
    draws: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    }
});

const User = mongoose.model('user', UserSchema);
module.exports = User;