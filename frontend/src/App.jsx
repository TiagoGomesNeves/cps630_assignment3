import { Routes, Route } from "react-router-dom";
import EntryPage from './components/EntryPage';
import Home from './components/Home';
import Game from'./components/Game';
import Leaderboard from './components/Leaderboard';
import { io } from 'socket.io-client';


const socket = io('http://localhost:8080');

function App() {

  return (
    <>
       <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path='/home' element={<Home socket={socket}/>} />
        <Route path="/game/:code" element={<Game socket={socket}/>}/>
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  )
}

export default App