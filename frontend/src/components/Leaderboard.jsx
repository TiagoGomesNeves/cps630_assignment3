import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";


function Leaderboard(){
    const location = useLocation();
    const token = location.state?.token;
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);


    useEffect(() => {
        if (!token) return;

        // Fetches leaderboard data from the backend
        const fetchLeaderboard = async () => {
            try{
                const response = await fetch('/api/leaderboard', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if(response.status === 200){
                    setPlayers(result);
                }else{
                    alert(result.error || 'Leaderboard Not Successful');
                }
            }catch(e){
                console.error('Leaderboard error: ', e);
                alert('Leaderboard Request Failed');
            }
        };

        fetchLeaderboard();
    }, [token]);


return (
    <>
        <Navbar />

        <h1>Leaderboard</h1>
        <button onClick={() => navigate('/home', { state: { token } })}>Back to Home</button>
        <hr />

        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Wins</th>
                    <th>Draws</th>
                    <th>Losses</th>
                    <th>Total Games</th>
                </tr>
            </thead>
            <tbody>
                {players.map((player, index) => (
                    <tr key={player.username}>
                        <td>{index + 1}</td>
                        <td>{player.username}</td>
                        <td>{player.wins}</td>
                        <td>{player.draws}</td>
                        <td>{player.losses}</td>
                        <td>{player.totalGames}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);
};
export default Leaderboard;