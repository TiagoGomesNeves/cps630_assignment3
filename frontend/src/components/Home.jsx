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
        <div className='page-container'>

            <div className='arcade-card lobby-card'>
                <h1 className='login-title'>GAME LOBBY</h1>

                {waiting ? (
                    <div className='waiting-section'>
                        <h2 className='arcade-font' style={{fontSize: '1.5rem'}}>ROOM CODE</h2>
                        <div className='room-code-display'>{roomCode}</div>
                        <p className='pulse-text'>WAITING FOR OPPONENT...</p>
                        <button className='submit-button cancel-btn' onClick={() => setWaiting(false)}>CANCEL</button>
                    </div>
                ) : (
                    <div className='lobby-actions'>
                        <div className='action-group'>
                            <button className='submit-button' onClick={handleCreate}>
                                CREATE ROOM
                            </button>
                        </div>

                        <div className='divider'>
                            <span className='divider-line'></span>
                            <span className='arcade-font' style={{fontSize: '1rem'}}>OR</span>
                            <span className='divider-line'></span>
                        </div>

                        <div className='action-group'>
                            <input 
                                className='arcade-input'
                                placeholder='ENTER CODE' 
                                value={code} 
                                onChange={(e) => setCode(e.target.value)} 
                            />
                            <button className='submit-button' style={{ marginLeft: '20px' }} onClick={handleJoin}>
                                JOIN ROOM
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};
export default Home;