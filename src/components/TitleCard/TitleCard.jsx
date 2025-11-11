import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { API_CONFIG, buildMovieUrl, buildTVUrl } from "../../services/config";
import { useCardInteractions } from "../../hooks/useCardInteractions";
import { useProfile } from "../../hooks/useProfile";
import { formatRuntime, formatContentRating } from "../../services/formatters";
import DetailsModal from "../DetailsModal/DetailsModal";
import dropdown from "../../assets/chevron_down.svg";
import "./TitleCard.css";

const API_KEY = API_CONFIG.API_KEY;
const BASE_URL = API_CONFIG.BASE_URL;

const TitleCard = ({
  // For carousel mode
  title,
  category,

  // For grid mode
  items = [],
  loading = false,

  // Common props
  mediaType = "movie",
  fromRoute = "/home",
  layout = "carousel",
  skeletonCount,
}) => {
  const { activeProfile } = useProfile();
  const isKidsProfile = activeProfile?.isKids || false;

  const getSkeletonCount = () => {
    if (skeletonCount !== undefined) {
      return skeletonCount;
    }
    return layout === "carousel" ? 10 : 20;
  };

  const SKELETON_COUNT = getSkeletonCount();
  const [apiData, setApiData] = useState([]);

  const {
    hoveredCard,
    cardDetails,
    overlayPosition,
    selectedCard,
    selectedCardType,
    isModalOpen,
    cardLogos,
    loadedImages,
    cardRefs,
    fetchCardLogo,
    handleCardHover,
    handleCardLeave,
    handleImageLoad,
    handleInfoClick,
    handlePlayClick,
    handleAddClick,
    closeModal,
    isFavorited,
  } = useCardInteractions({ mediaType, fromRoute });

  // Build API endpoint based on profile type
  const buildEndpoint = (category, mediaType) => {
    // For kids profiles, use discover endpoint with kids/family genre filters
    if (isKidsProfile) {
      const kidsGenres = mediaType === "tv" ? "10762,10751" : "10751,16"; // TV: Kids & Family, Movie: Family & Animation

      // Map categories to sort parameters
      let sortBy = "popularity.desc";
      if (category === "top_rated") {
        sortBy = "vote_average.desc&vote_count.gte=100";
      }

      return `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&language=en-US&with_genres=${kidsGenres}&sort_by=${sortBy}&page=1`;
    }

    // For regular profiles, use standard endpoints
    return mediaType === "tv"
      ? buildTVUrl(category || "popular")
      : buildMovieUrl(category || "now_playing");
  };

  // Fetch API data for carousel mode
  useEffect(() => {
    if (layout === "carousel" && category) {
      const endpoint = buildEndpoint(category, mediaType);

      fetch(endpoint, API_CONFIG.TMDB_AUTH_HEADER)
        .then((res) => res.json())
        .then((res) => {
          const results = res.results || [];
          setApiData(results);
          results.forEach((item) => {
            if (item.id) {
              fetchCardLogo(item.id, mediaType);
            }
          });
        })
        .catch((err) => console.error(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mediaType, layout, isKidsProfile]);

  // Fetch logos for grid items
  useEffect(() => {
    if (layout === "grid" && items.length > 0) {
      items.forEach((item) => {
        if (item.id) {
          const cardMediaType = item.type || mediaType;
          fetchCardLogo(item.id, cardMediaType);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, layout]);

  const NetflixPlaceholder = ({ index, title }) => (
    <div
      className="netflix-placeholder"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {title && <p className="placeholder-title">{title}</p>}
    </div>
  );

  const renderOverlay = (card) => {
    const cardMediaType = card.type || mediaType;
    const details = cardDetails[card.id];
    const isHovered = hoveredCard === card.id;
    const favorited = isFavorited(card.id.toString(), cardMediaType);

    if (!isHovered) return null;

    const overlayContent = (
      <div
        className="card-overlay-portal"
        style={{
          top: `${overlayPosition.top}px`,
          left: `${overlayPosition.left}px`,
        }}
        onMouseEnter={() => handleCardHover(card.id, cardMediaType)}
        onMouseLeave={handleCardLeave}
      >
        <div className="card-overlay">
          <div className="overlay-poster">
            {details?.backdropPath ? (
              <img
                src={`${API_CONFIG.TMDB_IMAGE_BASE_URL}${details.backdropPath}`}
                alt={
                  cardMediaType === "tv"
                    ? card.name
                    : card.original_title || card.title
                }
              />
            ) : (
              <div className="overlay-poster-gradient"></div>
            )}
          </div>
          <div className="overlay-details">
            {details ? (
              <>
                <div className="overlay-actions">
                  <div className="overlay-actions-left">
                    <button
                      className="action-btn play-btn"
                      title="Play"
                      onClick={(e) =>
                        handlePlayClick(e, card.id, cardMediaType)
                      }
                    >
                      ▶
                    </button>
                    <button
                      className={`action-btn add-btn ${
                        favorited ? "favorited" : ""
                      }`}
                      title={
                        favorited ? "Remove from Favorites" : "Add to Favorites"
                      }
                      onClick={(e) => handleAddClick(e, card, cardMediaType)}
                    >
                      {favorited ? "✓" : "+"}
                    </button>
                  </div>
                  <button
                    className="action-btn info-btn"
                    title="More Info"
                    onClick={(e) => handleInfoClick(e, card.id, cardMediaType)}
                  >
                    <img src={dropdown} alt="More Info" className="info-icon" />
                  </button>
                </div>

                <div className="overlay-meta">
                  <span className="content-rating">
                    {formatContentRating(details.contentRating)}
                  </span>
                  <span className="separator">•</span>
                  <span className="runtime-seasons">
                    {cardMediaType === "tv"
                      ? `${details.numberOfSeasons || "?"} Season${
                          details.numberOfSeasons !== 1 ? "s" : ""
                        }`
                      : formatRuntime(details.runtime)}
                  </span>
                </div>
                <div className="overlay-genres">
                  {details.genres.slice(0, 3).map((genre, idx) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                      {idx < Math.min(details.genres.length, 3) - 1 && " • "}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="overlay-skeleton">
                <div className="skeleton-actions">
                  <div className="skeleton-actions-left">
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                  <div className="skeleton-btn"></div>
                </div>
                <div className="skeleton-line skeleton-meta"></div>
                <div className="skeleton-line skeleton-genres"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(overlayContent, document.body);
  };

  const renderCards = () => {
    const cards = [];
    const dataSource = layout === "carousel" ? apiData : items;
    const totalCards =
      layout === "carousel"
        ? Math.max(SKELETON_COUNT, dataSource.length)
        : loading && dataSource.length === 0
        ? SKELETON_COUNT
        : dataSource.length;

    for (let i = 0; i < totalCards; i++) {
      const card = dataSource[i];
      const isLoaded = loadedImages.has(i);
      const hasData = !!card;

      if (!hasData) {
        cards.push(
          <div className="card" key={`skeleton-${i}`}>
            <NetflixPlaceholder index={i} title={null} />
          </div>
        );
      } else {
        const cardMediaType = card.type || mediaType;
        const displayTitle =
          cardMediaType === "tv"
            ? card.name || card.original_name
            : card.title || card.original_title;

        const imageUrl = `${API_CONFIG.TMDB_IMAGE_BASE_URL}${card.backdrop_path}`;

        const isHovered = hoveredCard === card.id;

        // Unique key that includes both id and type to ensure proper removal
        const uniqueKey = `${card.id}-${cardMediaType}`;

        cards.push(
          <div
            className={`card-wrapper ${isHovered ? "hovered" : ""}`}
            key={uniqueKey}
            ref={(el) => (cardRefs.current[card.id] = el)}
            onMouseEnter={() => handleCardHover(card.id, cardMediaType)}
            onMouseLeave={handleCardLeave}
          >
            <Link
              to={`/player/${card.id}`}
              state={{ from: fromRoute, mediaType: cardMediaType }}
              className="card"
            >
              {!isLoaded && (
                <NetflixPlaceholder index={i} title={displayTitle} />
              )}
              <img
                src={imageUrl}
                alt={displayTitle}
                onLoad={() => handleImageLoad(i)}
                className={isLoaded ? "loaded" : "loading"}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
              {cardLogos[card.id] && isLoaded && (
                <img
                  src={`${API_CONFIG.TMDB_IMAGE_BASE_URL}${cardLogos[card.id]}`}
                  alt={`${displayTitle} logo`}
                  className="card-logo"
                />
              )}
            </Link>
            {renderOverlay(card)}
          </div>
        );
      }
    }

    return cards;
  };

  if (layout === "carousel") {
    return (
      <div className="title-cards">
        <h2>{title ? title : "Popular on Netflix"}</h2>
        <div className="card-list">{renderCards()}</div>

        <DetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          contentId={selectedCard}
          mediaType={selectedCardType || mediaType}
        />
      </div>
    );
  }

  return (
    <>
      <div className="card-grid">{renderCards()}</div>

      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contentId={selectedCard}
        mediaType={selectedCardType || mediaType}
      />
    </>
  );
};

export default TitleCard;
