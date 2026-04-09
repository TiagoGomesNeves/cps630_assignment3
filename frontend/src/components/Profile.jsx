import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = location.state?.token;

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:8080/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) {
    return (
      <>
        <Navbar />
        <p style={{ color: "white", padding: "20px" }}>Loading...</p>
      </>
    );
  }

  return (
    <>
    <Navbar />

    <div className="page-container">
      
    <div className="arcade-card profile-card">
      <h1 className="login-title">PLAYER PROFILE</h1>

      <div className="profile-content">
        <div className="username-display">
          <span className="label">PLayer:</span>
          <span className="value">{stats.username}</span>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">GAMES PLAYED</span>
            <span className="stat-value">{stats.gamesPlayed}</span>
          </div>
          
          <div className="stat-item wins">
            <span className="stat-label">WINS</span>
            <span className="stat-value">{stats.wins}</span>
          </div>

          <div className="stat-item losses">
            <span className="stat-label">LOSSES</span>
            <span className="stat-value">{stats.losses}</span>
          </div>

          <div className="stat-item draws">
            <span className="stat-label">DRAWS</span>
            <span className="stat-value">{stats.draws}</span>
          </div>
        </div>

        <div className="win-rate-container">
          <div className="win-rate-label">
            Win Rate
          </div>
          <div className="win-rate-number">
            {stats.gamesPlayed > 0
              ? Math.round((stats.wins / stats.gamesPlayed) * 100) + "%"
              : "0%"}
          </div>
        </div>

      </div>

    </div>
  </div>
  </>
  );
};

export default Profile;