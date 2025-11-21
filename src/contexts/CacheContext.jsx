import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from "react";

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  API_DATA: 24 * 60 * 60 * 1000, // 24 hours
  LOGOS: 24 * 60 * 60 * 1000, // 24 hours
  DETAILS: 6 * 60 * 60 * 1000, // 6 hours
};

const CacheContext = createContext(null);

export const CacheProvider = ({ children }) => {
  const [isReady, setIsReady] = React.useState(false);

  // In-memory cache (fast access during session)
  const cache = useRef({
    apiData: new Map(), // Key: "mediaType:category" -> { data, timestamp }
    logos: new Map(), // Key: "cardId:mediaType" -> { path, timestamp }
    details: new Map(), // Key: "cardId:mediaType" -> { details, timestamp }
  });

  // Initialize cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tmdb_cache");
      if (stored) {
        const parsed = JSON.parse(stored);

        // Convert arrays back to Maps
        if (parsed.apiData) {
          cache.current.apiData = new Map(parsed.apiData);
        }
        if (parsed.logos) {
          cache.current.logos = new Map(parsed.logos);
        }
        if (parsed.details) {
          cache.current.details = new Map(parsed.details);
        }

        console.log("✅ Cache loaded from localStorage");
      }
    } catch (error) {
      console.warn("Failed to load cache from localStorage:", error);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Debounce timer for localStorage saves
  const saveTimeoutRef = useRef(null);

  // Save cache to localStorage (debounced)
  const saveToLocalStorage = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves by 500ms to avoid race conditions
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const cacheData = {
          apiData: Array.from(cache.current.apiData.entries()),
          logos: Array.from(cache.current.logos.entries()),
          details: Array.from(cache.current.details.entries()),
        };
        localStorage.setItem("tmdb_cache", JSON.stringify(cacheData));
        // console.log("💾 Cache saved to localStorage");
      } catch (error) {
        console.warn("Failed to save cache to localStorage:", error);
        // If quota exceeded, clear old entries
        if (error.name === "QuotaExceededError") {
          try {
            localStorage.removeItem("tmdb_cache");
            // console.log("Cleared localStorage cache due to quota");
          } catch (e) {
            console.error("Failed to clear localStorage:", e);
          }
        }
      }
    }, 500);
  }, []);

  // Check if cached data is still valid
  const isValid = useCallback((timestamp, expiryTime) => {
    return Date.now() - timestamp < expiryTime;
  }, []);

  // Get API data from cache
  const getApiData = useCallback(
    (mediaType, category) => {
      const key = `${mediaType}:${category}`;
      const cached = cache.current.apiData.get(key);

      if (cached && isValid(cached.timestamp, CACHE_EXPIRY.API_DATA)) {
        // console.log(`📦 Cache HIT: API data for ${key}`);
        return cached.data;
      }

      //   console.log(`❌ Cache MISS: API data for ${key}`);
      return null;
    },
    [isValid]
  );

  // Set API data in cache
  const setApiData = useCallback(
    (mediaType, category, data) => {
      const key = `${mediaType}:${category}`;
      cache.current.apiData.set(key, {
        data,
        timestamp: Date.now(),
      });
      saveToLocalStorage();
      //   console.log(`💾 Cached API data for ${key}`);
    },
    [saveToLocalStorage]
  );

  // Get logo from cache
  const getLogo = useCallback(
    (cardId, mediaType) => {
      const key = `${cardId}:${mediaType}`;
      const cached = cache.current.logos.get(key);

      if (cached && isValid(cached.timestamp, CACHE_EXPIRY.LOGOS)) {
        // console.log(`📦 Cache HIT: Logo for ${key}`);
        return cached.path;
      }

      //   console.log(`❌ Cache MISS: Logo for ${key}`);
      return null;
    },
    [isValid]
  );

  // Set logo in cache
  const setLogo = useCallback(
    (cardId, mediaType, path) => {
      const key = `${cardId}:${mediaType}`;
      cache.current.logos.set(key, {
        path,
        timestamp: Date.now(),
      });
      saveToLocalStorage();
      //   console.log(`💾 Cached logo for ${key}`);
    },
    [saveToLocalStorage]
  );

  // Get card details from cache
  const getDetails = useCallback(
    (cardId, mediaType) => {
      const key = `${cardId}:${mediaType}`;
      const cached = cache.current.details.get(key);

      if (cached && isValid(cached.timestamp, CACHE_EXPIRY.DETAILS)) {
        // console.log(`📦 Cache HIT: Details for ${key}`);
        return cached.details;
      }

      //   console.log(`❌ Cache MISS: Details for ${key}`);
      return null;
    },
    [isValid]
  );

  // Set card details in cache
  const setDetails = useCallback(
    (cardId, mediaType, details) => {
      const key = `${cardId}:${mediaType}`;
      cache.current.details.set(key, {
        details,
        timestamp: Date.now(),
      });
      saveToLocalStorage();
      //   console.log(`💾 Cached details for ${key}`);
    },
    [saveToLocalStorage]
  );

  // Clear expired entries (optional cleanup)
  const clearExpired = useCallback(() => {
    let cleared = 0;

    // Clear expired API data
    for (const [key, value] of cache.current.apiData.entries()) {
      if (!isValid(value.timestamp, CACHE_EXPIRY.API_DATA)) {
        cache.current.apiData.delete(key);
        cleared++;
      }
    }

    // Clear expired logos
    for (const [key, value] of cache.current.logos.entries()) {
      if (!isValid(value.timestamp, CACHE_EXPIRY.LOGOS)) {
        cache.current.logos.delete(key);
        cleared++;
      }
    }

    // Clear expired details
    for (const [key, value] of cache.current.details.entries()) {
      if (!isValid(value.timestamp, CACHE_EXPIRY.DETAILS)) {
        cache.current.details.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      saveToLocalStorage();
      //   console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }
  }, [isValid, saveToLocalStorage]);

  // Clear all cache (useful for debugging or user action)
  const clearAll = useCallback(() => {
    cache.current.apiData.clear();
    cache.current.logos.clear();
    cache.current.details.clear();
    try {
      localStorage.removeItem("tmdb_cache");
      console.log("🗑️ All cache cleared");
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }, []);

  // Periodic cleanup of expired entries (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpired();
    }, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [clearExpired]);

  const value = {
    getApiData,
    setApiData,
    getLogo,
    setLogo,
    getDetails,
    setDetails,
    clearExpired,
    clearAll,
    isReady,
  };

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
};
