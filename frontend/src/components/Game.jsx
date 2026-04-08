import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';


function Game({socket}) {
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

    const isMyTurn = turn === token;

    useEffect(() => {
        socket.on('moveMade', ({ board, turn }) => {
            setBoard(board);
            setTurn(turn);
        });

        socket.on('gameOver', ({ winner, board }) => {
            setBoard(board);
            setGameOver(true);
            if (winner === null) setResultMessage("It's a draw!");
            else if (winner === token) setResultMessage('You win!');
            else setResultMessage('You lose!');
        });

        socket.on('newMessage', ({ token: senderToken, message }) => {
            setMessages(prev => [...prev, { senderToken, message }]);
        });

        return () => {
            socket.off('moveMade');
            socket.off('gameOver');
            socket.off('newMessage');
        };
    }, []);

    const handleColumnClick = (column) => {
        console.log('clicked column:', column);
        console.log('isMyTurn:', isMyTurn);
        console.log('gameOver:', gameOver);
        console.log('turn:', turn);
        console.log('token:', token);
        if (!isMyTurn || gameOver) return;
        console.log('emitting makeMove');
        socket.emit('makeMove', { code, token, column });
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        socket.emit('sendMessage', { code, token, message: messageInput });
        setMessageInput('');
    };

    return (
        <>
            <h1>Connect 4</h1>
            <p>{gameOver ? resultMessage : isMyTurn ? 'Your turn' : "Opponent's turn"}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 60px)', gap: '4px' }}>
                {board.map((cell, i) => (
                    <div
                        key={i}
                        onClick={() => handleColumnClick(i % 7)}
                        style={{
                            width: 60, height: 60,
                            borderRadius: '50%',
                            backgroundColor: cell === 'R' ? 'red' : cell === 'Y' ? 'yellow' : 'white',
                            border: '2px solid #333',
                            cursor: isMyTurn && !gameOver ? 'pointer' : 'default'
                        }}
                    />
                ))}
            </div>
            {gameOver && <button onClick={() => navigate('/home', { state: { token } })}>Back to Home</button>}
            <div style={{ marginTop: '20px' }}>
                <h3>Chat</h3>
                <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #333', padding: '8px' }}>
                    {messages.map((msg, i) => (
                        <p key={i}>
                            <strong>{msg.senderToken === token ? 'You' : 'Opponent'}:</strong> {msg.message}
                        </p>
                    ))}
                </div>
                <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </>
    );
}

export default Game;