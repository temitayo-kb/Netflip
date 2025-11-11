import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MediaPage from "../../components/MediaPage/MediaPage";
import back_arrow_icon from "../../assets/back_arrow_icon.png";
import placeholderImage from "../../assets/placeholder_poster.avif";
import { API_CONFIG } from "../../services/config";

const API_KEY = API_CONFIG.API_KEY;
const BASE_URL = API_CONFIG.BASE_URL;

const SearchResults = () => {
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q");

  // Scroll to top on mount/navigation and when search query changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  // Fetch search results for both movies and TV shows
  useEffect(() => {
    if (!query) return;

    setLoading(true);
    Promise.all([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
          query
        )}&page=1`
      ).then((r) => r.json()),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
          query
        )}&page=1`
      ).then((r) => r.json()),
    ])
      .then(([moviesData, tvData]) => {
        const results = [
          ...moviesData.results.map((item) => ({ ...item, type: "movie" })),
          ...tvData.results.map((item) => ({ ...item, type: "tv" })),
        ];

        // Filter out items without backdrop_path
        const resultsWithImages = results.filter((item) => item.backdrop_path);

        setAllResults(resultsWithImages);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [query]);

  const handleBack = () => {
    navigate(-1);
  };

  // Custom header with back button
  const customHeader = (
    <div className="media-header">
      <div className="search-top-bar">
        <img
          src={back_arrow_icon}
          alt="Back"
          onClick={handleBack}
          style={{ cursor: "pointer", width: "32px", height: "32px" }}
        />
      </div>
    </div>
  );

  // Custom title
  const customTitle = `Found ${allResults.length} results for "${query}"`;

  // Custom no results message
  const customNoResultsMessage = (
    <>
      <h3>No results found for "{query}"</h3>
      <p>Try searching for something else</p>
    </>
  );

  return (
    <MediaPage
      items={allResults}
      genres={[]}
      loading={loading}
      activeGenre=""
      activeGenreName=""
      isDropdownOpen={false}
      mediaType="movie"
      onGenreSelect={() => {}}
      onToggleDropdown={() => {}}
      showMainCategories={false}
      mainCategories={[]}
      hasSearchQuery={true}
      placeholderImage={placeholderImage}
      fromRoute="/search"
      isSearchPage={true}
      customHeader={customHeader}
      customTitle={customTitle}
      customNoResultsMessage={customNoResultsMessage}
    />
  );
};

export default SearchResults;
