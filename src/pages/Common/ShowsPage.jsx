import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MediaPage from "../../components/MediaPage/MediaPage";
import { useMediaCollection } from "../../hooks/useMediaCollection";
import { useProfile } from "../../hooks/useProfile";
import placeholder_poster from "../../assets/placeholder_poster.avif";

const TVShows = () => {
  const location = useLocation();
  const { activeProfile } = useProfile();
  const isKidsProfile = activeProfile?.isKids || false;

  const {
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
  } = useMediaCollection({ mediaType: "tv" });

  // Scroll to top on mount/navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch genres on mount
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Load data based on URL (genre or search)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.get("search");

    if (searchQuery) {
      searchItems(searchQuery);
    } else {
      if (genres.length > 0) {
        fetchItems("popular");
      }
    }
  }, [location.search, genres.length, fetchItems, searchItems]);

  const mainCategories = [
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "on_air", label: "Currently Airing" },
  ];

  const hasSearchQuery = location.search.includes("search=");

  return (
    <MediaPage
      items={items}
      genres={genres}
      loading={loading}
      activeGenre={activeGenre}
      activeGenreName={activeGenreName}
      isDropdownOpen={isDropdownOpen}
      mediaType="tv"
      onGenreSelect={handleGenreSelect}
      onToggleDropdown={toggleDropdown}
      onSearch={searchItems}
      showMainCategories={true}
      mainCategories={mainCategories}
      hasSearchQuery={hasSearchQuery}
      placeholderImage={placeholder_poster}
      fromRoute="/tv-shows"
      isKidsProfile={isKidsProfile}
    />
  );
};

export default TVShows;
