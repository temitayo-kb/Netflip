// src/MovieProvider.jsx
import { useState, useEffect } from "react";
import { MovieContext } from "./MovieContext";

export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  const addToFavorites = (movie) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeFromFavorites = (movieId) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isFavorite = (movieId) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  const contextValue = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};
