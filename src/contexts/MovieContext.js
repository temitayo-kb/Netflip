// src/MovieContext.js
import { createContext, useContext } from "react";

const MovieContext = createContext();

export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieContext must be used within a MovieProvider");
  }
  return context;
};

export { MovieContext };
