import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

function Game({ socket }) {
    const location = useLocation();
    const { code } = useParams();
    const navigate = useNavigate();
    const token = location.state?.token;
    const initialTurn = location.state?.turn;

    const [board, setBoard] = useState(Array(42).fill(null));
    const [turn, setTurn] = useState(initialTurn);
    const [gameOver, setGameOver] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [disconnectMessage, setDisconnectMessage] = useState('');

    const gameOverRef = useRef(false);
    const leaveHandledRef = useRef(false);
    const cleanupArmedRef = useRef(false);
    const isMyTurn = turn === token;

    useEffect(() => {
        gameOverRef.current = gameOver;
    }, [gameOver]);

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) return;

        leaveHandledRef.current = false;
        cleanupArmedRef.current = false;

        const armCleanupTimer = setTimeout(() => {
            cleanupArmedRef.current = true;
        }, 0);

        const leaveGame = () => {
            if (leaveHandledRef.current || gameOverRef.current) {
                return;
            }

            leaveHandledRef.current = true;
            socket.emit('leaveGame', { code, token });
        };

        const handleMoveMade = ({ board, turn }) => {
            setBoard(board);
            setTurn(turn);
        };

        const handleGameOver = ({ winner, board, forfeitedBy, disconnectedBy }) => {
            setBoard(board);
            setGameOver(true);
            gameOverRef.current = true;
            setDisconnectMessage('');

            if (forfeitedBy) {
                if (forfeitedBy === token) setResultMessage('You forfeited. You lose!');
                else setResultMessage('Opponent forfeited. You win!');
            } else if (disconnectedBy) {
                if (disconnectedBy === token) setResultMessage('You disconnected for too long. You lose!');
                else setResultMessage('Opponent disconnected for too long. You win!');
            } else if (winner === null) {
                setResultMessage("It's a draw!");
            } else if (winner === token) {
                setResultMessage('You win!');
            } else {
                setResultMessage('You lose!');
            }
        };

        const handleNewMessage = ({ token: senderToken, message }) => {
            setMessages(prev => [...prev, { senderToken, message }]);
        };

        const handlePlayerDisconnected = ({ token: disconnectedToken }) => {
            if (disconnectedToken !== token) {
                setDisconnectMessage('Opponent disconnected. Waiting for reconnect...');
            }
        };

        const handlePlayerReconnected = ({ token: reconnectedToken }) => {
            if (reconnectedToken !== token) {
                setDisconnectMessage('');
            }
        };

        const handleRoomState = ({ board, turn, status, winner }) => {
            setBoard(board);
            setTurn(turn);
            setDisconnectMessage('');

            if (status === 'finished') {
                setGameOver(true);
                gameOverRef.current = true;

                if (winner === null) {
                    setResultMessage("It's a draw!");
                } else if (winner === token) {
                    setResultMessage('You win!');
                } else {
                    setResultMessage('You lose!');
                }
            } else {
                setGameOver(false);
                gameOverRef.current = false;
                setResultMessage('');
            }
        };

        const handleError = ({ message }) => {
            if (message === 'This game has already finished') {
                navigate('/home', { state: { token }, replace: true });
                return;
            }

            if (message === 'Room not found') {
                navigate('/home', { state: { token }, replace: true });
            }
        };

        const handlePopState = () => {
            leaveGame();
        };

        const handlePageHide = () => {
            leaveGame();
        };

        const handleBeforeUnload = () => {
            leaveGame();
        };

        socket.on('moveMade', handleMoveMade);
        socket.on('gameOver', handleGameOver);
        socket.on('newMessage', handleNewMessage);
        socket.on('playerDisconnected', handlePlayerDisconnected);
        socket.on('playerReconnected', handlePlayerReconnected);
        socket.on('roomState', handleRoomState);
        socket.on('error', handleError);

        socket.emit('rejoinRoom', { token, code });

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(armCleanupTimer);

            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            if (cleanupArmedRef.current) {
                leaveGame();
            }

            socket.off('moveMade', handleMoveMade);
            socket.off('gameOver', handleGameOver);
            socket.off('newMessage', handleNewMessage);
            socket.off('playerDisconnected', handlePlayerDisconnected);
            socket.off('playerReconnected', handlePlayerReconnected);
            socket.off('roomState', handleRoomState);
            socket.off('error', handleError);
        };
    }, [socket, token, code, navigate]);

    const handleColumnClick = (column) => {
        if (!isMyTurn || gameOver) return;
        socket.emit('makeMove', { code, token, column });
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        socket.emit('sendMessage', { code, token, message: messageInput });
        setMessageInput('');
    };

    const handleForfeit = () => {
        if (gameOver) return;
        leaveHandledRef.current = true;
        socket.emit('forfeitGame', { code, token });
        navigate('/home', { state: { token } });
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'row', gap: '10px', paddingBottom: '40px' }}>
            <div className="arcade-card game-card">
                <h1 className="login-title">Connect 4</h1>
                
                <p className={`status-text ${isMyTurn ? 'pulse-text' : ''}`}>
                    {gameOver ? resultMessage : isMyTurn ? 'Your turn' : "Opponent's turn"}
                </p>

                {disconnectMessage && !gameOver && <p className="error-text">{disconnectMessage}</p>}

                <div className="game-board">
                    {board.map((cell, i) => (
                        <div
                            key={i}
                            className={`cell ${cell === 'R' ? 'red-piece' : cell === 'Y' ? 'yellow-piece' : 'empty-cell'}`}
                            onClick={() => handleColumnClick(i % 7)}
                            style={{ cursor: isMyTurn && !gameOver ? 'pointer' : 'default' }}
                        />
                    ))}
                </div>

                <div className="game-actions">
                    {!gameOver ? (
                        <button className="navbar-button cancel-btn" onClick={handleForfeit}>Forfeit Match</button>
                    ) : (
                        <button className="submit-button" style={{ padding: '10px 20px' }} onClick={() => navigate('/home', { state: { token } })}>Back to Home</button>
                    )}
                </div>

            </div>

            <div className="arcade-card chat-card">
                <div className="chat-section">
                        <h3 className="login-title" style={{ marginTop: '20px' }}>Chat</h3>
                        <div className="chat-box">
                            {messages.map((msg, i) => (
                                <p key={i} className="chat-msg">
                                    <span className="chat-user">{msg.senderToken === token ? 'You' : 'Opponent'}:</span> {msg.message}
                                </p>
                            ))}
                        </div>
                        <div className="chat-input-container">
                            <input
                                className="arcade-input"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type..."
                            />
                            <button className="navbar-button send-btn" onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default Game;