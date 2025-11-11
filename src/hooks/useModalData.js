import { useState, useEffect } from "react";
import { API_CONFIG, buildDetailsUrl } from "../services/config";

export const useModalData = ({ isOpen, contentId, mediaType }) => {
  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !contentId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Parallel fetch for better performance
        const [detailsData, creditsData, recsData] = await Promise.all([
          fetchDetails(contentId, mediaType),
          fetchCredits(contentId, mediaType),
          fetchRecommendations(contentId, mediaType),
        ]);

        setDetails(detailsData);
        setCredits(creditsData);
        setRecommendations(recsData);
      } catch (_err) {
        console.error("Error fetching modal data:", _err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isOpen, contentId, mediaType]);

  return { details, credits, recommendations, loading };
};

// Helper functions for data fetching
const fetchDetails = async (contentId, mediaType) => {
  const detailsUrl = buildDetailsUrl(contentId, mediaType);
  const appendParam = mediaType === "tv" ? "content_ratings" : "release_dates";
  const fullUrl = `${detailsUrl}${
    detailsUrl.includes("?") ? "&" : "?"
  }append_to_response=${appendParam}`;

  const res = await fetch(fullUrl, API_CONFIG.TMDB_AUTH_HEADER);
  const data = await res.json();

  // Extract content rating
  const contentRating = extractContentRating(data, mediaType);

  return { ...data, contentRating };
};

const fetchCredits = async (contentId, mediaType) => {
  const url = `https://api.themoviedb.org/3/${mediaType}/${contentId}/credits`;
  const res = await fetch(url, API_CONFIG.TMDB_AUTH_HEADER);
  return res.json();
};

const fetchRecommendations = async (contentId, mediaType) => {
  const url = `https://api.themoviedb.org/3/${mediaType}/${contentId}/recommendations`;
  const res = await fetch(url, API_CONFIG.TMDB_AUTH_HEADER);
  const data = await res.json();

  // Filter and enrich recommendations
  const filtered =
    data.results
      ?.filter((rec) => rec.overview && rec.overview.length <= 300)
      .slice(0, 6) || [];

  // Fetch ratings and logos in parallel
  const enriched = await Promise.all(
    filtered.map(async (rec) => {
      try {
        const details = await fetchRecommendationDetails(rec.id, mediaType);
        return {
          ...rec,
          contentRating: details.rating,
          logoPath: details.logo,
        };
      } catch {
        return { ...rec, contentRating: "NR", logoPath: null };
      }
    })
  );

  return enriched;
};

const fetchRecommendationDetails = async (id, mediaType) => {
  const appendParam =
    mediaType === "tv" ? "content_ratings,images" : "release_dates,images";
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}?append_to_response=${appendParam}&include_image_language=en,null`;

  const res = await fetch(url, API_CONFIG.TMDB_AUTH_HEADER);
  const data = await res.json();

  return {
    rating: extractContentRating(data, mediaType),
    logo: data.images?.logos?.[0]?.file_path || null,
  };
};

const extractContentRating = (data, mediaType) => {
  if (mediaType === "tv") {
    const usRating = data.content_ratings?.results?.find(
      (r) => r.iso_3166_1 === "US"
    );
    return usRating?.rating || "TV-NR";
  } else {
    const usRelease = data.release_dates?.results?.find(
      (r) => r.iso_3166_1 === "US"
    );
    const certifications = usRelease?.release_dates || [];
    const cert =
      certifications.find((rel) => rel.certification) || certifications[0];
    return cert?.certification || "NR";
  }
};
