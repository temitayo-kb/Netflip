import { useState, useCallback } from "react";
import { useProfile } from "./useProfile";
import {
  API_CONFIG,
  buildGenreUrl,
  buildMovieUrl,
  buildTVUrl,
  buildDiscoverMovieUrl,
  buildDiscoverTVUrl,
  buildSearchUrl,
} from "../services/Config";

const API_KEY = API_CONFIG.API_KEY;
const BASE_URL = API_CONFIG.BASE_URL;

export const useMediaCollection = ({ mediaType = "movie" }) => {
  const { activeProfile } = useProfile();
  const isKidsProfile = activeProfile?.isKids || false;

  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("popular");
  const [activeGenreName, setActiveGenreName] = useState(
    mediaType === "tv" ? "Popular TV Shows" : "Popular Films"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Number of pages to fetch (5 pages = 100 items)
  const PAGES_TO_FETCH = 5;

  // Fetch genres for the media type
  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch(
        buildGenreUrl(mediaType),
        API_CONFIG.TMDB_AUTH_HEADER
      );
      const data = await response.json();

      // Filter genres for kids profiles
      if (isKidsProfile) {
        const kidsGenreIds =
          mediaType === "tv"
            ? [10762, 10751] // Kids, Family
            : [10751, 16]; // Family, Animation

        const filteredGenres = data.genres.filter((genre) =>
          kidsGenreIds.includes(genre.id)
        );
        setGenres(filteredGenres);
      } else {
        setGenres(data.genres);
      }
    } catch (error) {
      console.error(`Error fetching ${mediaType} genres:`, error);
    }
  }, [mediaType, isKidsProfile]);

  // Build URL with kids profile support
  const buildItemUrl = useCallback(
    (genreId) => {
      let baseUrl = "";

      // For kids profiles, always use discover endpoint with genre filters
      if (isKidsProfile) {
        const kidsGenres = mediaType === "tv" ? "10762,10751" : "10751,16";

        // Handle special categories for kids
        let sortBy = "popularity.desc";
        if (genreId === "top_rated") {
          sortBy = "vote_average.desc&vote_count.gte=100";
        } else if (genreId === "now_playing" && mediaType === "movie") {
          // For now playing, use release date filters
          const today = new Date().toISOString().split("T")[0];
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];
          return `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=en-US&with_genres=${kidsGenres}&primary_release_date.gte=${monthAgo}&primary_release_date.lte=${today}&sort_by=popularity.desc`;
        } else if (genreId === "on_air" && mediaType === "tv") {
          // For on air, use air date filters
          const today = new Date().toISOString().split("T")[0];
          return `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=en-US&with_genres=${kidsGenres}&air_date.lte=${today}&sort_by=popularity.desc`;
        } else if (genreId !== "popular" && genreId !== "top_rated") {
          // Specific genre selected - add it to the kids genres
          return `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&sort_by=${sortBy}`;
        }

        // Default: popular kids content
        return `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=en-US&with_genres=${kidsGenres}&sort_by=${sortBy}`;
      }

      // Regular profile logic (original behavior)
      if (mediaType === "tv") {
        if (genreId === "popular") {
          baseUrl = buildTVUrl("popular");
        } else if (genreId === "top_rated") {
          baseUrl = buildTVUrl("top_rated");
        } else if (genreId === "on_air") {
          baseUrl = buildTVUrl("on_the_air");
        } else {
          baseUrl = buildDiscoverTVUrl(genreId);
        }
      } else {
        if (genreId === "popular") {
          baseUrl = buildMovieUrl("popular");
        } else if (genreId === "top_rated") {
          baseUrl = buildMovieUrl("top_rated");
        } else if (genreId === "now_playing") {
          baseUrl = buildMovieUrl("now_playing");
        } else {
          baseUrl = buildDiscoverMovieUrl(genreId);
        }
      }

      return baseUrl;
    },
    [mediaType, isKidsProfile]
  );

  // Fetch items (movies or TV shows) - Multiple pages
  const fetchItems = useCallback(
    async (genreId = "popular") => {
      try {
        setLoading(true);
        const baseUrl = buildItemUrl(genreId);

        // Fetch multiple pages in parallel
        const fetchPromises = [];
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
          const separator = baseUrl.includes("?") ? "&" : "?";
          const urlWithPage = `${baseUrl}${separator}page=${page}`;

          fetchPromises.push(
            fetch(urlWithPage, API_CONFIG.TMDB_AUTH_HEADER).then((res) =>
              res.json()
            )
          );
        }

        // Wait for all pages to load
        const results = await Promise.all(fetchPromises);

        // Combine all results from all pages
        const allItems = results.flatMap((data) => data.results || []);

        // Remove duplicates based on id
        const uniqueItems = allItems.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        setItems(uniqueItems);
      } catch (error) {
        console.error(`Error fetching ${mediaType}:`, error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [mediaType, buildItemUrl]
  );

  // Search items - Also fetch multiple pages
  const searchItems = useCallback(
    async (query) => {
      try {
        setLoading(true);
        const baseUrl = buildSearchUrl(query, mediaType);

        // Fetch multiple pages for search too
        const fetchPromises = [];
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
          const separator = baseUrl.includes("?") ? "&" : "?";
          const urlWithPage = `${baseUrl}${separator}page=${page}`;

          fetchPromises.push(
            fetch(urlWithPage, API_CONFIG.TMDB_AUTH_HEADER).then((res) =>
              res.json()
            )
          );
        }

        const results = await Promise.all(fetchPromises);
        let allItems = results.flatMap((data) => data.results || []);

        // Filter for kids content if kids profile
        if (isKidsProfile) {
          const kidsGenreIds =
            mediaType === "tv" ? [10762, 10751] : [10751, 16];

          allItems = allItems.filter((item) => {
            if (!item.genre_ids) return false;
            return item.genre_ids.some((id) => kidsGenreIds.includes(id));
          });
        }

        // Remove duplicates based on id
        const uniqueItems = allItems.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        setItems(uniqueItems);
        setActiveGenreName(
          `${mediaType === "tv" ? "TV Shows" : "Films"} matching "${query}"`
        );
      } catch (error) {
        console.error(`Error searching ${mediaType}:`, error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [mediaType, isKidsProfile]
  );

  // Get display name for a genre ID
  const getGenreName = useCallback(
    (genreId) => {
      let name = "";

      if (mediaType === "tv") {
        if (genreId === "popular") {
          name = "Popular TV Shows";
        } else if (genreId === "top_rated") {
          name = "Top Rated TV Shows";
        } else if (genreId === "on_air") {
          name = "Currently Airing";
        } else {
          const genre = genres.find((g) => g.id === parseInt(genreId));
          name = genre ? `${genre.name} TV Shows` : "TV Shows";
        }
      } else {
        if (genreId === "popular") {
          name = "Popular Films";
        } else if (genreId === "top_rated") {
          name = "Top Rated Films";
        } else if (genreId === "now_playing") {
          name = "Now Playing";
        } else {
          const genre = genres.find((g) => g.id === parseInt(genreId));
          name = genre ? `${genre.name} Films` : "Films";
        }
      }

      return name;
    },
    [mediaType, genres]
  );

  // Handle genre selection with immediate UI feedback
  const handleGenreSelect = (genreId) => {
    setActiveGenre(genreId);
    setItems([]); // Clear items to show skeletons immediately
    setActiveGenreName(getGenreName(genreId)); // Update title immediately
    setIsDropdownOpen(false);
    fetchItems(genreId); // Fetch new data
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return {
    genres,
    items,
    loading,
    activeGenre,
    activeGenreName,
    isDropdownOpen,
    fetchGenres,
    fetchItems,
    searchItems,
    handleGenreSelect,
    toggleDropdown,
  };
};
