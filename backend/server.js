const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const mongoose = require('mongoose');
const User = require('./models/User');

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

// Authorization middleware used to protect routes must b placed in all api's
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



app.listen(PORT, () => { console.log("Server started on port: " + PORT) });