import React, { useState } from "react";
import "./HeroCard.css";
import play_icon from "../../assets/play_icon.png";
import info_icon from "../../assets/info_icon.png";
import TitleCard from "../TitleCard/TitleCard";
import DetailsModal from "../DetailsModal/DetailsModal";
import { API_CONFIG } from "../../services/config";

const IMAGE_BASE_URL = API_CONFIG.TMDB_IMAGE_BASE_URL;

const HeroCard = ({ heroShow, loading, onPlayClick, mediaType = "tv" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
  };

  const handleMoreInfoClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Show skeleton while API is loading
  if (loading) {
    return (
      <div className="hero">
        <div className="hero-skeleton">
          <div className="hero-skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  if (!heroShow) {
    return null;
  }

  return (
    <>
      <div className="hero">
        {/* Show skeleton while image is loading */}
        {!imageLoaded && (
          <>
            <div className="hero-skeleton">
              <div className="hero-skeleton-shimmer"></div>
            </div>
            <div className="hero-skeleton-caption">
              {/* Empty space for positioning */}
            </div>
          </>
        )}

        <img
          src={`${API_CONFIG.TMDB_IMAGE_ORIGINAL_URL}${heroShow.backdrop_path}`}
          alt={heroShow.name || heroShow.title}
          className={`banner-img ${imageLoaded ? "loaded" : "loading"}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Only show logo/title and buttons when image is loaded */}
        <div className="hero-caption">
          {imageLoaded && (
            <>
              {/* Show logo if available, otherwise show title text */}
              {heroShow.logo ? (
                <img
                  src={`${IMAGE_BASE_URL}${heroShow.logo}`}
                  alt={heroShow.name || heroShow.title}
                  className="caption-img logo-img"
                />
              ) : (
                <h1 className="hero-title-text">
                  {heroShow.name || heroShow.title}
                </h1>
              )}
              <div className="hero-btns">
                <button className="btn" onClick={onPlayClick}>
                  <img src={play_icon} alt="Play" />
                  Play
                </button>
                <button className="btn dark-btn" onClick={handleMoreInfoClick}>
                  <img src={info_icon} alt="More Info" />
                  More Info
                </button>
              </div>
            </>
          )}
          {/* TitleCards always renders, never unmounts */}
          <TitleCard
            layout="carousel"
            category="popular"
            title="Popular on Netflix"
            mediaType="movie"
          />
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contentId={heroShow?.id}
        mediaType={mediaType}
      />
    </>
  );
};

export default HeroCard;
