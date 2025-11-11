import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";
import { API_CONFIG } from "../services/Config";

const API_KEY = API_CONFIG.API_KEY;
const BASE_URL = API_CONFIG.BASE_URL;

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
};

const getStorageKey = (profileId) => {
  return `hero_show_${profileId}`;
};

const getCachedShow = (profileId) => {
  try {
    const cached = localStorage.getItem(getStorageKey(profileId));
    if (!cached) return null;

    const data = JSON.parse(cached);
    const today = getTodayDate();

    // Check if cached data is from today
    if (data.fetchDate === today) {
      return data.showData;
    }

    // Data is old, remove it
    localStorage.removeItem(getStorageKey(profileId));
    return null;
  } catch (error) {
    console.error("Error reading cached hero show:", error);
    return null;
  }
};

const cacheShow = (profileId, showData) => {
  try {
    const cacheData = {
      showData,
      fetchDate: getTodayDate(),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(profileId), JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching hero show:", error);
  }
};

export const useDailyHero = () => {
  const { activeProfile } = useProfile();
  const [heroShow, setHeroShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyShow = async (isKidsProfile) => {
    try {
      setLoading(true);

      let url;
      let results = [];

      if (isKidsProfile) {
        // Fetch kids/family content (Genre ID 10762 = Kids, 10751 = Family)
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&with_genres=10762,10751&sort_by=popularity.desc&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        results = data.results || [];
      } else {
        // Fetch trending content (movies + TV shows) for regular profiles
        url = `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`;
        const response = await fetch(url);
        const data = await response.json();

        // Filter for recent content (released/aired in the last 10 years)
        const currentYear = new Date().getFullYear();
        const cutoffYear = currentYear - 10;

        results = (data.results || []).filter((item) => {
          const releaseDate = item.release_date || item.first_air_date;
          if (!releaseDate) return false;

          const releaseYear = new Date(releaseDate).getFullYear();
          return releaseYear >= cutoffYear;
        });
      }

      if (results.length > 0) {
        // Get a random item from top 10 results for variety
        const randomIndex = Math.floor(
          Math.random() * Math.min(10, results.length)
        );
        const selectedItem = results[randomIndex];

        // Determine media type (movie or tv)
        const mediaType = selectedItem.media_type || "tv";

        // Fetch additional details including images
        const detailsUrl = `${BASE_URL}/${mediaType}/${selectedItem.id}?api_key=${API_KEY}&append_to_response=images,videos`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        // Check for logo image
        const logoImage = detailsData.images?.logos?.[0]?.file_path || null;

        const enrichedItem = {
          ...selectedItem,
          media_type: mediaType,
          logo: logoImage,
          videos: detailsData.videos?.results || [],
        };

        return enrichedItem;
      }

      return null;
    } catch (error) {
      console.error("Error fetching daily hero:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHeroShow = async () => {
      if (!activeProfile) {
        setLoading(false);
        return;
      }

      // Try to get cached show for this profile
      const cached = getCachedShow(activeProfile.id);

      if (cached) {
        setHeroShow(cached);
        setLoading(false);
      } else {
        const newShow = await fetchDailyShow(activeProfile.isKids);

        if (newShow) {
          setHeroShow(newShow);
          cacheShow(activeProfile.id, newShow);
        }
      }
    };

    loadHeroShow();
  }, [activeProfile]);

  return { heroShow, loading };
};
