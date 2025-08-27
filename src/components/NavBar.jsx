// src/components/NavBar.jsx
import { NavLink } from "react-router-dom";
import "../css/NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        Netflip
      </NavLink>
      <div className="navbar-links">
        <NavLink
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          to="/"
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Home
        </NavLink>
        <NavLink
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          to="/favorites"
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Favorites
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
