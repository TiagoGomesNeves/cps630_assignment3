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

  return (
    <div>
      <button onClick={handleHome}>Home</button>
      <button onClick={handleProfile}>Profile</button> 
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;