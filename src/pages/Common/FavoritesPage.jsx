import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import MediaPage from "../../components/MediaPage/MediaPage";
import { useFavorites } from "../../hooks/useFavorites";
import placeholder_poster from "../../assets/placeholder_poster.avif";

const Favorites = () => {
  const location = useLocation();
  const { favorites, loading } = useFavorites();
  const [activeFilter, setActiveFilter] = useState("all");

  // Scroll to top on mount/navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q");

  // Use useMemo to ensure filtered favorites updates when favorites changes
  const filteredFavorites = useMemo(() => {
    // Sort by addedAt (newest first) and filter by type
    let filtered = [...favorites].sort((a, b) => {
      return new Date(b.addedAt) - new Date(a.addedAt);
    });

    // Filter by media type (movies/tv/all)
    if (activeFilter === "movies") {
      filtered = filtered.filter((fav) => fav.itemType === "movie");
    } else if (activeFilter === "tv") {
      filtered = filtered.filter((fav) => fav.itemType === "tv");
    }

    // Filter by search query if present
    if (searchQuery && searchQuery.trim() !== "") {
      filtered = filtered.filter((fav) =>
        fav.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    return filtered;
  }, [favorites, activeFilter, searchQuery]);

  // Transform favorites to match UnifiedTitleCard expected format
  const transformedItems = useMemo(() => {
    return filteredFavorites.map((favorite) => ({
      id: favorite.itemId,
      title: favorite.title,
      name: favorite.title,
      backdrop_path: favorite.backdrop_path || favorite.poster_path,
      poster_path: favorite.poster_path,
      vote_average: favorite.vote_average,
      release_date: favorite.release_date,
      first_air_date: favorite.release_date,
      type: favorite.itemType,
    }));
  }, [filteredFavorites]);

  // Main categories for Favorites
  const mainCategories = [
    {
      id: "all",
      label: `All Favorites ${!loading ? `(${favorites.length})` : ""}`,
    },
    {
      id: "movies",
      label: `Films ${
        !loading
          ? `(${favorites.filter((f) => f.itemType === "movie").length})`
          : ""
      }`,
    },
    {
      id: "tv",
      label: `TV Shows ${
        !loading
          ? `(${favorites.filter((f) => f.itemType === "tv").length})`
          : ""
      }`,
    },
  ];

  // Custom header with categories
  const customHeader = (
    <div className="media-header">
      {!searchQuery && favorites.length > 0 && (
        <div className="main-categories">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                activeFilter === category.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Custom title
  const getTitle = () => {
    if (favorites.length === 0) return null;

    if (searchQuery) {
      const filterLabel =
        activeFilter === "all"
          ? "All Favorites"
          : activeFilter === "movies"
          ? "Films"
          : "TV Shows";
      return `${filterLabel} matching "${searchQuery}"`;
    }

    return activeFilter === "all"
      ? "All Favorites"
      : activeFilter === "movies"
      ? "Favorite Films"
      : "Favorite TV Shows";
  };

  // Custom no results message
  const customNoResultsMessage = searchQuery ? (
    <>
      <h3>No favorites match "{searchQuery}"</h3>
      <p>Try a different search term or clear your search.</p>
    </>
  ) : (
    <>
      <h3>No favorites yet.</h3>
      <p>
        {activeFilter === "all"
          ? "Start adding your favorite movies and TV shows!"
          : activeFilter === "movies"
          ? "No favorite movies yet. Browse the Movies page to add some!"
          : "No favorite TV shows yet. Browse the TV Shows page to add some!"}
      </p>
    </>
  );

  // Determine mediaType based on active filter (for mixed content, default to "movie")
  const currentMediaType =
    activeFilter === "tv"
      ? "tv"
      : activeFilter === "movies"
      ? "movie"
      : "movie";

  return (
    <MediaPage
      items={transformedItems}
      genres={[]}
      loading={loading}
      activeGenre={activeFilter}
      activeGenreName=""
      isDropdownOpen={false}
      mediaType={currentMediaType}
      onGenreSelect={() => {}}
      onToggleDropdown={() => {}}
      showMainCategories={false}
      mainCategories={[]}
      hasSearchQuery={!!searchQuery}
      placeholderImage={placeholder_poster}
      fromRoute="/favorites"
      isFavoritesPage={true}
      customHeader={customHeader}
      customTitle={getTitle()}
      customNoResultsMessage={customNoResultsMessage}
      skeletonCount={filteredFavorites.length}
    />
  );
};

export default Favorites;
