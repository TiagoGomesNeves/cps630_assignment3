# CPS630 Assignment 3, Final Submission

## Team Members

- Abdu-R-Raheem Ishfaq
- Tiago Gomes Neves
- Muhammad Taha
- Milad Safi

## Overview

We built a MERN web application that allows two users to play Connect 4 against each other in real time. The project uses a React and Vite frontend, a Node.js and Express backend, a MongoDB database connected through Mongoose, and Socket.io for live communication between the clients and server. It also includes authentication, so users can sign up, log in, and have their own stored profile data and game statistics.

The application includes several different views that each serve a clear purpose. The landing and login flow allows users to either create an account or sign in to an existing one. The Home page allows users to create a room, receive a room code, or join an existing room using a code shared by another player. The Game page is the main part of the application, where two players compete in a live Connect 4 match, send chat messages to each other, and see immediate updates as moves are made. The Profile page shows a user their own statistics, including wins, losses, draws, total games played, and win rate. The Leaderboard page displays all users ranked by their results.

The purpose of our app is to provide a fun and interactive multiplayer game while also showing a meaningful use of the full MERN stack. From the start, we wanted to create something more creative than a standard full stack CRUD application, so we focused on building a retro arcade style website with a clear visual identity. We feel the final result stayed true to that vision while still being practical and easy to use. Overall, the project brings together the main assignment requirements through its full stack structure, authentication, persistent user data, REST API communication, real time gameplay, and complete user interface.

## Documentation

### Project Structure

The project is split into two main folders.

`frontend/` contains the React and Vite client.

`backend/` contains the Node.js and Express server, Socket.io logic, REST API endpoints, and MongoDB models.

### Setup and Run

Before running the project, make sure Node.js, npm, and MongoDB are installed on your machine.

Start MongoDB locally first.

```bash
mongod
```

Open a terminal and go into the backend folder.

```bash
cd backend
```

Install dependencies.

```bash
npm install
```

Start the backend server.

```bash
npm start
```

If needed, the server can also be started with.

```bash
node server.js
```

The backend runs on `http://localhost:8080`.

Open a second terminal and go into the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the frontend.

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

Once both servers are running, open `http://localhost:5173` in the browser.

### How to Use

New users can register an account by entering a username and password. Existing users can log in using their credentials. After logging in or signing up, the user is redirected into the application.

A default test account is also available for quick access.

Username, `admin`

Password, `adminpass123`

Username, `defaultUser`

Password, `userPass123`

On the Home page, a user can create a room and receive a room code, or enter an existing room code to join another player. If a user creates a room and changes their mind, they can cancel while waiting.

On the Game page, two users play Connect 4 against each other in real time. Players take turns dropping pieces into the board, can send live chat messages during the match, and can also forfeit if needed. If a player disconnects, the opponent is notified, and the game handles reconnects and disconnect timeouts.

On the Profile page, users can view their own statistics, including username, wins, losses, draws, games played, and win rate.

On the Leaderboard page, all users are displayed and ranked by wins first, then draws, then username in alphabetical order.

### Pages and Routes

`/` , landing page.

`/login` , login page.

`/signup` , signup page.

`/home` , game lobby page.

`/game/:code` , live game page for a room.

`/profile` , user profile page.

`/leaderboard` , leaderboard page.

### REST API

`POST /api/auth/signup`

Creates a new user account and returns a token on success.

`POST /api/auth/login`

Checks login credentials and returns a token on success.

`GET /api/profile`

Returns the authenticated user's profile data, including username, wins, losses, draws, and games played.

`GET /api/leaderboard`

Returns leaderboard data for all users, including username, wins, draws, losses, and total games played.

Protected routes require a bearer token in the request header.

## Reflection

Our submission includes the full MERN project with both the frontend and backend folders, all required source files, package configuration files, static assets, MongoDB model files, this README, and the short demo video.

One of our biggest successes during this assignment was the creativity of the overall idea and theme. From the start, our vision was to build a retro arcade style website, and we are proud of how closely the final project stayed true to that idea. The overall game concept, visual style, and smaller touches throughout the site helped make it feel more fun and more complete. We were also happy with how we approached the development process. We focused on getting the main functionality working first, then left most of the CSS and visual polish until later, which ended up working very well once the core features were in place.

Another big success was our coordination as a group and our use of GitHub throughout the project. Working with branches and merging changes helped us divide responsibilities while still keeping everything organised. This made collaboration much smoother and helped us keep track of what had already been completed and what still needed work.

As for challenges, most of them came from smaller edge cases that showed up while testing. A lot of our progress came from going back, testing different user flows, and patching issues as we found them. Overall, we are very happy with how the final application came together. This assignment helped improve our understanding of React, Express, MongoDB, Mongoose, REST APIs, Socket.io, and GitHub collaboration. In the future, we could see this being expanded into a larger retro arcade style website with more games and features.
