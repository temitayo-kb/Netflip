import React, { useEffect, useState } from "react";
import "./Player.css";
import back_arrow_icon from "../../assets/back_arrow_icon.png";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get mediaType from navigation state, default to 'movie' if not provided
  const mediaType = location.state?.mediaType || "movie";

  const handleBack = () => {
    const fromRoute = location.state?.from || "/home";
    navigate(fromRoute);
  };

  useEffect(() => {
    const loadTrailer = async () => {
      setLoading(true);
      setError(null);

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZjhlNmFhNzcyNDk4N2YwYWEyMjEzZGRlYzhiNmYxYyIsIm5iZiI6MTc1NTY4ODgwOC40OTgsInN1YiI6IjY4YTVhZjY4MWM1MzA0YTExMTY5NzE1MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lHEmCxx5KVa1BAvESiPvtvt9sTjYsCMY8tWpP5oZsUc",
        },
      };

      try {
        // Use the correct endpoint based on mediaType
        const endpoint = mediaType === "tv" ? "tv" : "movie";
        const url = `https://api.themoviedb.org/3/${endpoint}/${id}/videos?language=en-US`;

        const response = await fetch(url, options);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          // Find trailer (prefer official trailer, then teaser, then first available)
          const trailer =
            data.results.find(
              (video) => video.type === "Trailer" && video.site === "YouTube"
            ) ||
            data.results.find(
              (video) => video.type === "Teaser" && video.site === "YouTube"
            ) ||
            data.results[0];

          setApiData(trailer);
        } else {
          setError("No trailer available for this content");
        }
      } catch (err) {
        console.error("Error fetching trailer:", err);
        setError("Failed to load trailer");
      } finally {
        setLoading(false);
      }
    };

    loadTrailer();
  }, [id, mediaType]);

  if (loading) {
    return (
      <div className="player">
        <img src={back_arrow_icon} alt="Back" onClick={handleBack} />
        <div className="loading">Loading trailer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player">
        <img src={back_arrow_icon} alt="Back" onClick={handleBack} />
        <div className="error-message">
          <h3>{error}</h3>
          <p>This content doesn't have an available trailer.</p>
          <button onClick={handleBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player">
      <img src={back_arrow_icon} alt="Back" onClick={handleBack} />
      <iframe
        width="90%"
        height="90%"
        src={`https://www.youtube.com/embed/${apiData.key}?autoplay=1&mute=1`}
        title={`${mediaType === "movie" ? "Movie" : "TV Show"} Trailer`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Player;
