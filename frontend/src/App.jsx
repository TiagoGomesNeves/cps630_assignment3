import { Routes, Route } from "react-router-dom";
import EntryPage from './components/EntryPage';
import Home from './components/Home';
import Game from'./components/Game';
import Login from './components/Login';
import Signup from './components/Signup';
import Leaderboard from './components/Leaderboard';
import { io } from 'socket.io-client';
import './css/App.css'

const socket = io('http://localhost:8080');

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path='/home' element={<Home socket={socket}/>} />
        <Route path="/game/:code" element={<Game socket={socket}/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  )
}

export default App;