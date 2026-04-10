import { useState , useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import CursorRunner from '../components/CursorRunner';

function Home({socket}){
    const location = useLocation();
    const token = location.state?.token;
    const navigate = useNavigate();    
    const [code , setCode ] = useState('');
    const [waiting, setWaiting] = useState(false);
    const [roomCode, setRoomCode] = useState('');

    const waitingRef = useRef(false);
    const roomCodeRef = useRef('');

    useEffect(() => {
        waitingRef.current = waiting;
    }, [waiting]);

    useEffect(() => {
        roomCodeRef.current = roomCode;
    }, [roomCode]);
    
    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);

    const cancelWaitingRoom = () => {
        const currentRoomCode = roomCodeRef.current;

        if (!token || !waitingRef.current || !currentRoomCode) {
            return;
        }

        socket.emit('cancelWaitingRoom', { token, code: currentRoomCode });
        waitingRef.current = false;
        roomCodeRef.current = '';
    };

    useEffect(() => {
        if (!token) return;

        socket.on('roomCreated', ({ code }) => {
            roomCodeRef.current = code;
            waitingRef.current = true;
            setRoomCode(code);
            setWaiting(true);
        });

        socket.on('gameStart', ({ code, turn }) => {
            waitingRef.current = false;
            roomCodeRef.current = '';
            setWaiting(false);
            setRoomCode('');
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

    useEffect(() => {
        const handlePageHide = () => {
            cancelWaitingRoom();
        };

        const handleBeforeUnload = () => {
            cancelWaitingRoom();
        };

        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            cancelWaitingRoom();
        };
    }, [socket, token]);

    const handleCreate = () => {
        socket.emit('createRoom', { token });
    };

    const handleJoin = () => {
        if (!code) return alert('Enter a room code');
        socket.emit('joinRoom', { token, code });
    };

    const handleCancel = () => {
        cancelWaitingRoom();
        setWaiting(false);
        setRoomCode('');
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
                        <button className='submit-button cancel-btn' onClick={handleCancel}>CANCEL</button>
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
                                <button className='submit-button' onClick={handleJoin}>
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