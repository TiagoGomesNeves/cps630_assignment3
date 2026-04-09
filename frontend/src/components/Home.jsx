import { useState , useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import CursorRunner from '../components/CursorRunner';

function Home({socket}){
    const location = useLocation();
    const token = location.state?.token;
    const navigate = useNavigate();

    console.log('Home token:', token);
    
    const [code , setCode ] = useState('');
    const [waiting, setWaiting] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    
    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);


    useEffect(() => {
        if (!token) return;

        socket.on('roomCreated', ({ code }) => {
            setRoomCode(code);
            setWaiting(true);
        });

        socket.on('gameStart', ({ code, turn }) => {
            navigate(`/game/${code}`, { state: { token: token, turn: turn} });
        });

        socket.on('error', ({ message }) => {
            alert(message);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('gameStart');
            socket.off('error');
        };
    }, [socket, navigate, token]);


    const handleCreate = () => {
        socket.emit('createRoom', { token });
    };

    const handleJoin = () => {
        if (!code) return alert('Enter a room code');
        socket.emit('joinRoom', { token, code });
    };

return ( 
    <>
        <CursorRunner />

        <Navbar />

        <h1>Home</h1>
        {waiting ? (
            <>
                <p>Room Code: <strong>{roomCode}</strong></p>
                <p>Waiting for opponent to join...</p>
            </>
        ) : (
            <>
                <button onClick={handleCreate}>Create Room</button>
                <hr />
                <input 
                    placeholder='Enter room code' 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                />
                <button onClick={handleJoin}>Join Room</button>
            </>
        )}
    </>
);
};
export default Home;