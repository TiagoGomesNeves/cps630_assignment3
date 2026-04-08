import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  
    navigate("/", { replace: true });
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px",
      background: "#eee"
    }}>
      <h3>Home</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;