import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../services/Config";
import { useFavorites } from "./useFavorites";

export const useCardInteractions = ({ fromRoute }) => {
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();

  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardDetails, setCardDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardLogos, setCardLogos] = useState({});
  const [loadingLogos, setLoadingLogos] = useState({});
  const [loadedImages, setLoadedImages] = useState(new Set());

  const hoverTimeoutRef = useRef(null);
  const cardRefs = useRef({});

  // Fetch card logo
  const fetchCardLogo = useCallback(
    async (cardId, cardMediaType) => {
      if (loadingLogos[cardId] || cardLogos[cardId]) return;

      setLoadingLogos((prev) => ({ ...prev, [cardId]: true }));

      try {
        const url = `https://api.themoviedb.org/3/${cardMediaType}/${cardId}/images`;
        const response = await fetch(url, API_CONFIG.TMDB_AUTH_HEADER);

        if (!response.ok) {
          console.warn(
            `Logo not found for ${cardMediaType} ID ${cardId} (${response.status})`
          );
          setLoadingLogos((prev) => ({ ...prev, [cardId]: false }));
          return;
        }

        const data = await response.json();
        const logos = data.logos || [];
        const englishLogo = logos.find((logo) => logo.iso_639_1 === "en");
        const logo = englishLogo || logos[0];

        if (logo) {
          setCardLogos((prev) => ({
            ...prev,
            [cardId]: logo.file_path,
          }));
        }
      } catch (error) {
        console.warn(
          `Error fetching logo for ${cardMediaType} ID ${cardId}:`,
          error.message
        );
      } finally {
        setLoadingLogos((prev) => ({ ...prev, [cardId]: false }));
      }
    },
    [cardLogos, loadingLogos]
  );

  // Fetch card details (genres, rating, etc.)
  const fetchCardDetails = useCallback(async (cardId, cardMediaType) => {
    setLoadingDetails((prev) => ({ ...prev, [cardId]: true }));

    try {
      const baseUrl = `https://api.themoviedb.org/3/${cardMediaType}/${cardId}`;
      const appendParams =
        cardMediaType === "tv"
          ? "?append_to_response=content_ratings"
          : "?append_to_response=release_dates";
      const url = baseUrl + appendParams;

      const response = await fetch(url, API_CONFIG.TMDB_AUTH_HEADER);
      const data = await response.json();

      let contentRating = "NR";
      if (cardMediaType === "tv") {
        const usRating = data.content_ratings?.results?.find(
          (r) => r.iso_3166_1 === "US"
        );
        contentRating = usRating?.rating || "NR";
      } else {
        const usRelease = data.release_dates?.results?.find(
          (r) => r.iso_3166_1 === "US"
        );

        if (usRelease?.release_dates) {
          for (const releaseDate of usRelease.release_dates) {
            if (
              releaseDate.certification &&
              releaseDate.certification.trim() !== ""
            ) {
              contentRating = releaseDate.certification;
              break;
            }
          }
        }
      }

      setCardDetails((prev) => ({
        ...prev,
        [cardId]: {
          genres: data.genres || [],
          rating: data.vote_average || 0,
          contentRating: contentRating,
          runtime: data.runtime || null,
          numberOfSeasons: data.number_of_seasons || null,
          backdropPath: data.backdrop_path || null,
        },
      }));
    } catch (error) {
      console.error("Error fetching card details:", error);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [cardId]: false }));
    }
  }, []);

  // Handle card hover with positioning logic
  const handleCardHover = useCallback(
    (cardId, cardMediaType) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCard(cardId);

        const cardElement = cardRefs.current[cardId];
        if (cardElement) {
          const rect = cardElement.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset;
          const scrollX = window.scrollX || window.pageXOffset;

          const overlayWidth = 240;
          const overlayHeight = 250;
          const scale = 1.4;
          const scaledWidth = overlayWidth * scale;
          const scaledHeight = overlayHeight * scale;

          const cardCenterX = rect.left + scrollX + rect.width / 2;
          const cardCenterY = rect.top + scrollY + rect.height / 2;

          let left = cardCenterX - overlayWidth / 2;
          let top = cardCenterY - overlayHeight / 2;

          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          const overlayLeft = left - (scaledWidth - overlayWidth) / 2;
          const overlayRight =
            left + overlayWidth + (scaledWidth - overlayWidth) / 2;
          const overlayTop = top - (scaledHeight - overlayHeight) / 2;
          const overlayBottom =
            top + overlayHeight + (scaledHeight - overlayHeight) / 2;

          if (overlayLeft < scrollX) {
            left = scrollX + (scaledWidth - overlayWidth) / 2;
          } else if (overlayRight > scrollX + viewportWidth) {
            left =
              scrollX +
              viewportWidth -
              scaledWidth +
              (scaledWidth - overlayWidth) / 2;
          }

          if (overlayTop < scrollY) {
            top = scrollY + (scaledHeight - overlayHeight) / 2;
          } else if (overlayBottom > scrollY + viewportHeight) {
            top =
              scrollY +
              viewportHeight -
              scaledHeight +
              (scaledHeight - overlayHeight) / 2;
          }

          setOverlayPosition({
            top: top,
            left: left,
            width: rect.width,
          });
        }

        if (!cardDetails[cardId] && !loadingDetails[cardId]) {
          fetchCardDetails(cardId, cardMediaType);
        }
      }, 500);
    },
    [cardDetails, loadingDetails, fetchCardDetails]
  );

  // Handle card leave
  const handleCardLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCard(null);
  }, []);

  // Image loading handlers
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  const handleImageError = useCallback((index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  // Action handlers
  const handleInfoClick = useCallback(
    (e, cardId, cardMediaType) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedCard(cardId);
      setSelectedCardType(cardMediaType);
      setIsModalOpen(true);
      handleCardLeave();
    },
    [handleCardLeave]
  );

  const handlePlayClick = useCallback(
    (e, cardId, cardMediaType) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/player/${cardId}`, {
        state: { from: fromRoute, mediaType: cardMediaType },
      });
    },
    [navigate, fromRoute]
  );

  const handleAddClick = useCallback(
    async (e, card, cardMediaType) => {
      e.preventDefault();
      e.stopPropagation();
      await toggleFavorite(card, cardMediaType);
    },
    [toggleFavorite]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    // State
    hoveredCard,
    cardDetails,
    loadingDetails,
    overlayPosition,
    selectedCard,
    selectedCardType,
    isModalOpen,
    cardLogos,
    loadingLogos,
    loadedImages,
    cardRefs,

    // Methods
    fetchCardLogo,
    fetchCardDetails,
    handleCardHover,
    handleCardLeave,
    handleImageLoad,
    handleImageError,
    handleInfoClick,
    handlePlayClick,
    handleAddClick,
    closeModal,
    isFavorited,
  };
};
