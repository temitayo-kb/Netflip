import React, { useEffect } from "react";
import "./MediaPage.css";
import Navbar from "../../components/Navbar/Navbar";
import TitleCard from "../TitleCard/TitleCard";
import Footer from "../../components/Footer/Footer";

const MediaPage = ({
  items,
  genres,
  loading,
  activeGenre,
  activeGenreName,
  isDropdownOpen,
  mediaType,
  onGenreSelect,
  onToggleDropdown,
  showMainCategories = true,
  mainCategories = [],
  hasSearchQuery = false,
  placeholderImage,
  fromRoute = "/home",
  isFavoritesPage = false,
  isSearchPage = false,
  customHeader = null,
  customTitle = null,
  customNoResultsMessage = null,
  skeletonCount,
  isKidsProfile = false,
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".genre-dropdown") && isDropdownOpen) {
        onToggleDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggleDropdown, isDropdownOpen]);

  return (
    <>
      <Navbar />
      <div className="media-page page-transition">
        {/* Custom Header or Default Header */}
        {customHeader ? (
          customHeader
        ) : (
          <div className="media-header">
            {showMainCategories && !hasSearchQuery && (
              <div className="main-categories">
                {mainCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${
                      activeGenre === category.id ? "active" : ""
                    }`}
                    onClick={() => onGenreSelect(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}

            {!hasSearchQuery &&
              !isFavoritesPage &&
              !isSearchPage &&
              !isKidsProfile && (
                <div className="genre-dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={onToggleDropdown}
                  >
                    <span>Genres</span>
                    <svg
                      className="dropdown-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.726 5.557a.8.8 0 01-.002 1.106l-3.5 3.5a.8.8 0 01-1.105 0l-3.5-3.5A.8.8 0 014.45 5.557L8 9.107l3.55-3.55a.8.8 0 011.106.002z"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <h3>Genres</h3>
                      </div>
                      <div className="dropdown-content">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            className={`dropdown-item ${
                              activeGenre === genre.id.toString()
                                ? "active"
                                : ""
                            }`}
                            onClick={() => onGenreSelect(genre.id.toString())}
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}

        {/* Custom Title or Default Title */}
        {customTitle !== null ? (
          customTitle && (
            <h2 className="current-selection-title">{customTitle}</h2>
          )
        ) : (
          <h2 className="current-selection-title">{activeGenreName}</h2>
        )}

        {/* Unified Grid - No need for media-grid wrapper, UnifiedTitleCard handles it */}
        <TitleCard
          layout="grid"
          items={items}
          loading={loading}
          mediaType={mediaType}
          fromRoute={fromRoute}
          placeholderImage={placeholderImage}
          skeletonCount={skeletonCount}
        />

        {/* Custom No Results Message or Default */}
        {items.length === 0 && !loading && (
          <div className="no-results">
            {customNoResultsMessage || (
              <>
                <h3>No {mediaType === "tv" ? "TV shows" : "Films"} found.</h3>
                <p>
                  {hasSearchQuery
                    ? "Try a different search term or browse genres."
                    : "Try selecting a different genre."}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MediaPage;
