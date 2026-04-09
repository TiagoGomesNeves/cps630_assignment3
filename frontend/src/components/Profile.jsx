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

      <div style={{
        padding: "30px",
        color: "white",
        background: "#1e1e1e",
        minHeight: "100vh"
      }}>
        <h1 style={{ marginBottom: "20px" }}>Profile</h1>

        <div style={{
          background: "#2c2c2c",
          padding: "20px",
          borderRadius: "10px",
          width: "300px"
        }}>
          <p><strong>Username:</strong> {stats.username}</p>

          <hr />

          <p><strong>Games Played:</strong> {stats.gamesPlayed}</p>
          <p><strong>Wins:</strong> {stats.wins}</p>
          <p><strong>Losses:</strong> {stats.losses}</p>
          <p><strong>Draws:</strong> {stats.draws}</p>

          <hr />

          <p>
            <strong>Win Rate:</strong>{" "}
            {stats.gamesPlayed > 0
              ? Math.round((stats.wins / stats.gamesPlayed) * 100) + "%"
              : "0%"}
          </p>
        </div>
      </div>
    </>
  );
};

export default Profile;