import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/Netflip_logo.png";
import search_icon from "../../assets/search_icon.svg";
import caret_icon from "../../assets/caret_icon.svg";
import { avatars } from "../../assets/Avatars/";
import edit_icon from "../../assets/edit_icon.svg";
import logout_icon from "../../assets/logout_icon.svg";
import { logout } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";

const Navbar = () => {
  const navRef = useRef();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProfile, setActiveProfile, profiles } = useProfile();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (location.pathname === "/tv-shows") {
        navigate(`/tv-shows?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (location.pathname === "/movies") {
        navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (location.pathname === "/favorites") {
        navigate(`/favorites?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery("");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    if (navRef.current) {
      const handleScroll = () => {
        if (window.scrollY >= 20) {
          navRef.current.classList.add("nav-dark");
        } else {
          navRef.current.classList.remove("nav-dark");
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div
      ref={navRef}
      className={`navbar ${activeProfile?.isKids ? "kids-theme" : ""}`}
    >
      <div className="navbar-left">
        <img
          className={isActive("/home") ? "active" : ""}
          onClick={() => navigate("/home")}
          src={logo}
          alt="Logo"
        />
        <ul>
          <li
            onClick={() => navigate("/home")}
            className={isActive("/home") ? "active" : ""}
          >
            Home
          </li>
          <li
            onClick={() => navigate("/tv-shows")}
            className={isActive("/tv-shows") ? "active" : ""}
          >
            TV Shows
          </li>
          <li
            onClick={() => navigate("/movies")}
            className={isActive("/movies") ? "active" : ""}
          >
            Films
          </li>
          <li
            onClick={() => navigate("/favorites")}
            className={isActive("/favorites") ? "active" : ""}
          >
            Favorites
          </li>
        </ul>

        <div className="browse">
          <p>Browse</p>
          <img src={caret_icon} alt="Dropdown" className="icon" />
          <div className="dropdown">
            <div className="dropdown-item" onClick={() => navigate("/home")}>
              <p className={isActive("/home") ? "active" : ""}>Home</p>
            </div>
            <div
              className="dropdown-item"
              onClick={() => navigate("/tv-shows")}
            >
              <p className={isActive("/tv-shows") ? "active" : ""}>TV Shows</p>
            </div>
            <div className="dropdown-item" onClick={() => navigate("/movies")}>
              <p className={isActive("/movies") ? "active" : ""}>Films</p>
            </div>
            <div
              className="dropdown-item"
              onClick={() => navigate("/favorites")}
            >
              <p className={isActive("/favorites") ? "active" : ""}>
                Favorites
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={
              location.pathname === "/tv-shows"
                ? "Search TV shows..."
                : location.pathname === "/movies"
                ? "Search Films..."
                : location.pathname === "/favorites"
                ? "Search Favorites..."
                : "Search Films and TV Shows..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={search_icon} alt="Search" className="icons" />
          </button>
        </form>
        {!activeProfile?.isKids && (
          <p
            className="kids-text"
            onClick={() => {
              const kidsProfile = profiles.find((p) => p.isKids === true);
              if (kidsProfile) {
                setActiveProfile(kidsProfile);
                navigate("/home");
              }
            }}
          >
            Kids
          </p>
        )}
        <div className="navbar-profile">
          {/* Active Profile Avatar */}

          <img
            src={
              activeProfile
                ? avatars[activeProfile.avatar]
                : Object.values(avatars)[1]
            }
            alt="Profile"
            className="profile"
          />
          <img src={caret_icon} alt="Dropdown" />

          <div className="dropdown">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`dropdown-item ${
                  activeProfile?.id === profile.id ? "active-profile" : ""
                }`}
                onClick={() => {
                  setActiveProfile(profile);
                  navigate("/home");
                }}
              >
                <img
                  src={avatars[profile.avatar]}
                  alt={profile.name}
                  className="dropdown-avatar"
                />
                <p>{profile.name}</p>
              </div>
            ))}
            {!activeProfile?.isKids && (
              <div
                className="dropdown-item"
                onClick={() =>
                  navigate("/manage-profiles", { state: { from: "/home" } })
                }
              >
                <img src={edit_icon} alt="Edit" className="dropdown-icon" />
                <p>Manage Profiles</p>
              </div>
            )}
            <div className="dropdown-item" onClick={logout}>
              <img src={logout_icon} alt="Edit" className="dropdown-icon" />
              <p>Sign Out</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
