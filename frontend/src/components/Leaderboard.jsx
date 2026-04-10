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
        <div className="page-container">
            <Navbar />

            <div className="arcade-card leaderboard-card">
                <h1 className="scoreboard-title">LEADERBOARD</h1>

                <div>
                    <table className="scoreboard-table">
                        <thead>
                            <tr className="table-headers">
                                <th>POSITION</th>
                                <th>USERNAME</th>
                                <th>WINS</th>
                                <th>LOSSES</th>
                                <th>DRAWS</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr key={player.username} className="score-row">
                                    <td>{index + 1}</td>
                                    <td>{player.username}</td>
                                    <td>{player.wins}</td>
                                    <td>{player.losses}</td>
                                    <td>{player.draws}</td>
                                    <td>{player.totalGames}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
    );
};
export default Leaderboard;