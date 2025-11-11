export const API_CONFIG = {
  API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500", // For cards/thumbnails
  TMDB_IMAGE_ORIGINAL_URL: "https://image.tmdb.org/t/p/original", // For hero/backdrop images

  // Authorization header for TMDB API
  TMDB_AUTH_HEADER: {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_AUTH_TOKEN}`,
    },
  },
};

// Helper functions for building URLs
export const buildMovieUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/movie/${endpoint}?api_key=${API_CONFIG.API_KEY}&language=en-US&page=1`;
};

export const buildTVUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}/tv/${endpoint}?api_key=${API_CONFIG.API_KEY}&language=en-US&page=1`;
};

export const buildDiscoverMovieUrl = (genreId) => {
  return `${API_CONFIG.BASE_URL}/discover/movie?api_key=${API_CONFIG.API_KEY}&language=en-US&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
};

export const buildDiscoverTVUrl = (genreId) => {
  return `${API_CONFIG.BASE_URL}/discover/tv?api_key=${API_CONFIG.API_KEY}&language=en-US&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
};

export const buildGenreUrl = (type) => {
  const genreType = type === "tv" ? "tv" : "movie";
  return `${API_CONFIG.BASE_URL}/genre/${genreType}/list?api_key=${API_CONFIG.API_KEY}&language=en-US`;
};

export const buildSearchUrl = (query, type) => {
  const searchType = type === "tv" ? "tv" : "movie";
  return `${API_CONFIG.BASE_URL}/search/${searchType}?api_key=${
    API_CONFIG.API_KEY
  }&language=en-US&query=${encodeURIComponent(query)}&page=1`;
};

export const buildVideoUrl = (id, type) => {
  const mediaType = type === "tv" ? "tv" : "movie";
  return `${API_CONFIG.BASE_URL}/${mediaType}/${id}/videos?language=en-US`;
};

export const buildDetailsUrl = (id, type) => {
  const mediaType = type === "tv" ? "tv" : "movie";
  return `${API_CONFIG.BASE_URL}/${mediaType}/${id}?api_key=${API_CONFIG.API_KEY}&append_to_response=images,videos`;
};
