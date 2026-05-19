import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="navbar">
      <h2>🍔 FoodApp</h2>

      <div className="row">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        <Link to="/orders">Orders</Link>

        {isAuthenticated ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
