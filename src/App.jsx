// import React, { useEffect } from "react";
// import Home from "./pages/Home/Home";
// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import Login from "./pages/Login/Login";
// import Player from "./pages/Player/Player";
// import Profiles from "./pages/Profiles/Profiles";
// import ManageProfiles from "./pages/ManageProfiles/ManageProfiles";
// import SearchResults from "./pages/Common/SearchPage";
// import TVShows from "./pages/Common/ShowsPage";
// import Movies from "./pages/Common/MoviesPage";
// import Favorites from "./pages/Common/FavoritesPage";

// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebase";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ProfileProvider } from "./contexts/ProfileContext";
// import { FavoritesProvider } from "./contexts/FavoritesProvider";

// const App = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user && location.pathname === "/") {
//         navigate("/profiles");
//       } else if (!user && !["/", "/profiles"].includes(location.pathname)) {
//         navigate("/");
//       }
//     });
//     return () => unsubscribe();
//   }, [navigate, location.pathname]);

//   return (
//     <ProfileProvider>
//       <FavoritesProvider>
//         <ToastContainer theme="dark" />
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/profiles" element={<Profiles />} />
//           <Route path="/home" element={<Home />} />
//           <Route path="/player/:id" element={<Player />} />
//           <Route path="/search" element={<SearchResults />} />
//           <Route path="/manage-profiles" element={<ManageProfiles />} />
//           <Route path="/tv-shows" element={<TVShows />} />
//           <Route path="/movies" element={<Movies />} />
//           <Route path="/favorites" element={<Favorites />} />
//         </Routes>
//       </FavoritesProvider>
//     </ProfileProvider>
//   );
// };

// export default App;

/////////////////////////////////////

import React, { useEffect, useState } from "react";
import Home from "./pages/Home/Home";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login/Login";
import Player from "./pages/Player/Player";
import Profiles from "./pages/Profiles/Profiles";
import ManageProfiles from "./pages/ManageProfiles/ManageProfiles";
import SearchResults from "./pages/Common/SearchPage";
import TVShows from "./pages/Common/ShowsPage";
import Movies from "./pages/Common/MoviesPage";
import Favorites from "./pages/Common/FavoritesPage";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProfileProvider } from "./contexts/ProfileContext";
import { FavoritesProvider } from "./contexts/FavoritesProvider";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser && location.pathname === "/") {
        navigate("/profiles");
      } else if (
        !currentUser &&
        !["/", "/profiles"].includes(location.pathname)
      ) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  if (!authChecked) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        {/* Optional: Add Netflix logo here */}
      </div>
    );
  }

  // If user is authenticated and trying to access login page, don't render it
  if (user && location.pathname === "/") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />
    );
  }

  return (
    <ProfileProvider>
      <FavoritesProvider>
        <ToastContainer theme="dark" />
        <div style={{ animation: "fadeIn 0.3s ease-in" }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/home" element={<Home />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/manage-profiles" element={<ManageProfiles />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </div>
      </FavoritesProvider>
    </ProfileProvider>
  );
};

export default App;
