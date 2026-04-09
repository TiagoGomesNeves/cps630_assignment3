import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  const handleHome = () => {
    navigate("/home", { state: location.state }); 
  };

  const handleProfile = () => {
    navigate("/profile", { state: location.state });
  };

  const handleLeaderboard = () => {
    navigate("/leaderboard", { state: location.state });
  }

  return (
    <div className="navbar">
      <button className="navbar-button" onClick={handleHome}>
        <img src="/images/home.png" alt="Home" className="navbar-icon" />
        Home
      </button>
      <button className="navbar-button" onClick={handleProfile}>
        <img src="/images/person.png" alt="Profile" className="navbar-icon" style={{ width: '45px', height: '25px' }} />
        Profile
      </button>
      <button className="navbar-button" onClick={handleLeaderboard}>
        <img src="/images/trophy.png" alt="Leaderboard" className="navbar-icon" />
        Leaderboard
      </button>
      <button className="logout-button" onClick={handleLogout}>
        <img src="/images/logout.png" alt="Logout" className="navbar-icon" />
        Logout
      </button>
    </div>
  );
};

export default Navbar;