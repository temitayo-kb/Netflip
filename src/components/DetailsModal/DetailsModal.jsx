import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../services/config";
import { useFavorites } from "../../hooks/useFavorites";
import { useModalData } from "../../hooks/useModalData";
import {
  formatRuntime,
  getYear,
  formatContentRating,
  getRatingDescription,
} from "../../services/formatters";

import play_icon from "../../assets/play_icon.png";
import add_icon from "../../assets/add_icon.svg";
import "./DetailsModal.css";

const DetailsModal = ({ isOpen, onClose, contentId, mediaType = "movie" }) => {
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const aboutSectionRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Use custom hook for data fetching
  const { details, credits, recommendations, loading } = useModalData({
    isOpen,
    contentId,
    mediaType,
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const scrollToAbout = () => {
    if (aboutSectionRef.current && modalContainerRef.current) {
      const container = modalContainerRef.current;
      const element = aboutSectionRef.current;
      const elementPosition = element.offsetTop - container.offsetTop;

      container.scrollTo({
        top: elementPosition - 20,
        behavior: "smooth",
      });
    }
  };

  const handlePlayClick = (id) => {
    navigate(`/player/${id}`, {
      state: { from: "/home", mediaType: mediaType },
    });
    onClose();
  };

  const handleAddClick = async (item, type) => {
    await toggleFavorite(item, type);
  };

  const isFavoritedItem = (id, type) => {
    return isFavorited(id.toString(), type);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="modal-hero">
              <button className="modal-close" onClick={onClose}>
                ✕
              </button>
              <img
                src={`${API_CONFIG.TMDB_IMAGE_ORIGINAL_URL}${details?.backdrop_path}`}
                alt={mediaType === "tv" ? details?.name : details?.title}
                className="modal-hero-image"
              />
              <div className="modal-hero-overlay">
                <div className="modal-hero-content">
                  <h1 className="modal-title">
                    {mediaType === "tv" ? details?.name : details?.title}
                  </h1>
                  <div className="modal-hero-buttons">
                    <button
                      className="modal-btn modal-btn-play"
                      onClick={() => handlePlayClick(contentId)}
                    >
                      <img src={play_icon} alt="Play" className="btn-icon" />
                      Play
                    </button>
                    <button
                      className={`modal-btn-circle modal-btn-add ${
                        isFavoritedItem(contentId, mediaType) ? "favorited" : ""
                      }`}
                      title={
                        isFavoritedItem(contentId, mediaType)
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                      onClick={() => handleAddClick(details, mediaType)}
                    >
                      {isFavoritedItem(contentId, mediaType) ? (
                        <span className="check-icon">✓</span>
                      ) : (
                        <img src={add_icon} alt="Add" className="add-icon" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="modal-content">
              <div className="modal-info-grid">
                {/* Left Column */}
                <div className="modal-info-left">
                  <div className="modal-meta">
                    <span className="meta-year">
                      {getYear(
                        mediaType === "tv"
                          ? details?.first_air_date
                          : details?.release_date
                      )}
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="meta-rating">
                      {formatContentRating(details?.contentRating)}
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="meta-runtime">
                      {mediaType === "tv"
                        ? `${details?.number_of_seasons || "?"} Season${
                            details?.number_of_seasons !== 1 ? "s" : ""
                          }`
                        : formatRuntime(details?.runtime)}
                    </span>
                  </div>

                  <p className="modal-overview">{details?.overview}</p>
                </div>

                {/* Right Column */}
                <div className="modal-info-right">
                  {credits?.cast && credits.cast.length > 0 && (
                    <div className="info-item">
                      <span className="info-label">Cast:</span>
                      <span className="info-value">
                        {credits.cast
                          .slice(0, 4)
                          .map((c) => c.name)
                          .join(", ")}
                        {", "}
                        <span className="more-link" onClick={scrollToAbout}>
                          more
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="info-item">
                    <span className="info-label">Genres:</span>
                    <span className="info-value">
                      {details?.genres?.map((g) => g.name).join(", ")}
                    </span>
                  </div>

                  {(details?.keywords?.keywords?.length > 0 ||
                    details?.keywords?.length > 0) && (
                    <div className="info-item">
                      <span className="info-label">
                        This {mediaType === "tv" ? "show" : "movie"} is:
                      </span>
                      <span className="info-value">
                        {(details.keywords?.keywords || details.keywords)
                          ?.slice(0, 3)
                          .map((k) => k.name)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {credits?.crew && (
                    <>
                      {credits.crew.find((c) => c.job === "Director") && (
                        <div className="info-item">
                          <span className="info-label">Director:</span>
                          <span className="info-value">
                            {
                              credits.crew.find((c) => c.job === "Director")
                                ?.name
                            }
                          </span>
                        </div>
                      )}

                      {credits.crew.filter(
                        (c) => c.job === "Writer" || c.job === "Screenplay"
                      ).length > 0 && (
                        <div className="info-item">
                          <span className="info-label">Writer(s):</span>
                          <span className="info-value">
                            {credits.crew
                              .filter(
                                (c) =>
                                  c.job === "Writer" || c.job === "Screenplay"
                              )
                              .slice(0, 2)
                              .map((c) => c.name)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {details?.production_companies?.[0] && (
                    <div className="info-item">
                      <span className="info-label">Production:</span>
                      <span className="info-value">
                        {details.production_companies[0].name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* More Like This */}
              {recommendations.length > 0 && (
                <div className="modal-recommendations">
                  <h3 className="section-title">More Like This</h3>
                  <div className="recommendations-grid">
                    {recommendations.map((rec) => {
                      const recFavorited = isFavoritedItem(rec.id, mediaType);
                      return (
                        <div key={rec.id} className="recommendation-card">
                          <div className="rec-poster">
                            <img
                              src={`${API_CONFIG.TMDB_IMAGE_BASE_URL}${
                                rec.backdrop_path || rec.poster_path
                              }`}
                              alt={mediaType === "tv" ? rec.name : rec.title}
                            />
                            <div className="rec-poster-overlay">
                              {rec.logoPath ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w500${rec.logoPath}`}
                                  alt={`${
                                    mediaType === "tv" ? rec.name : rec.title
                                  } logo`}
                                  className="rec-logo"
                                />
                              ) : (
                                <h4 className="rec-title-fallback">
                                  {mediaType === "tv" ? rec.name : rec.title}
                                </h4>
                              )}
                            </div>
                          </div>
                          <div className="rec-info">
                            <div className="rec-header">
                              <div className="rec-actions">
                                <button
                                  className="rec-btn rec-play"
                                  title="Play"
                                  onClick={() => handlePlayClick(rec.id)}
                                >
                                  <img
                                    src={play_icon}
                                    alt="Play"
                                    className="btn-icon"
                                  />
                                </button>
                                <button
                                  className={`rec-btn rec-add ${
                                    recFavorited ? "favorited" : ""
                                  }`}
                                  title={
                                    recFavorited
                                      ? "Remove from Favorites"
                                      : "Add to Favorites"
                                  }
                                  onClick={() => handleAddClick(rec, mediaType)}
                                >
                                  {recFavorited ? (
                                    <span className="check-icon-small">✓</span>
                                  ) : (
                                    <img
                                      src={add_icon}
                                      alt="Add"
                                      className="add-icon"
                                    />
                                  )}
                                </button>
                              </div>
                              <div className="rec-meta">
                                <span className="rec-rating">
                                  {formatContentRating(rec.contentRating)}
                                </span>
                                <span className="meta-separator">•</span>
                                <span className="rec-year">
                                  {getYear(
                                    mediaType === "tv"
                                      ? rec.first_air_date
                                      : rec.release_date
                                  )}
                                </span>
                              </div>
                            </div>
                            <p className="rec-overview">{rec.overview}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* About Section */}
              <div className="modal-about" ref={aboutSectionRef}>
                <h3 className="section-title">
                  About {mediaType === "tv" ? details?.name : details?.title}
                </h3>

                {credits?.cast && credits.cast.length > 0 && (
                  <div className="about-item">
                    <span className="about-label">Cast:</span>
                    <span className="about-value">
                      {credits.cast
                        .slice(0, 20)
                        .map((c) => c.name)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {credits?.crew && (
                  <>
                    {credits.crew.filter(
                      (c) => c.job === "Writer" || c.job === "Screenplay"
                    ).length > 0 && (
                      <div className="about-item">
                        <span className="about-label">Writers:</span>
                        <span className="about-value">
                          {credits.crew
                            .filter(
                              (c) =>
                                c.job === "Writer" || c.job === "Screenplay"
                            )
                            .slice(0, 10)
                            .map((c) => c.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="about-item">
                  <span className="about-label">Genres:</span>
                  <span className="about-value">
                    {details?.genres?.map((g) => g.name).join(", ")}
                  </span>
                </div>

                <div className="about-item">
                  <span className="about-label">Maturity Rating:</span>
                  <span className="about-value">
                    {formatContentRating(details?.contentRating)} -{" "}
                    {getRatingDescription(details?.contentRating)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DetailsModal;
