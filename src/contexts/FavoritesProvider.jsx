import React, { useState, useEffect, useCallback } from "react";
import {
  auth,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../firebase";
import { useProfile } from "../hooks/useProfile";
import { FavoritesContext } from "./FavoritesContext";

export const FavoritesProvider = ({ children }) => {
  const { activeProfile } = useProfile();
  const [favorites, setFavorites] = useState([]);
  const [favoritesMap, setFavoritesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load all favorites for active profile
  const loadFavorites = useCallback(async () => {
    if (!authReady || !auth.currentUser || !activeProfile) {
      return;
    }

    setLoading(true);
    try {
      const userFavorites = await getFavorites(
        auth.currentUser.uid,
        activeProfile.id
      );

      setFavorites(userFavorites);

      // Create a map for quick lookup: "itemId-itemType" -> true
      const map = new Map();
      userFavorites.forEach((fav) => {
        map.set(`${fav.itemId}-${fav.itemType}`, true);
      });
      setFavoritesMap(map);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, authReady]);

  // Load favorites when auth is ready and profile changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Check if specific item is favorited
  const isFavorited = useCallback(
    (itemId, itemType) => {
      return favoritesMap.has(`${itemId}-${itemType}`);
    },
    [favoritesMap]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (item, itemType) => {
      if (!auth.currentUser || !activeProfile) return false;

      const itemId = item.id.toString();
      const key = `${itemId}-${itemType}`;
      const currentlyFavorited = favoritesMap.has(key);

      // Check limit before adding
      if (!currentlyFavorited && favorites.length >= 100) {
        return false;
      }

      try {
        if (currentlyFavorited) {
          // Remove from favorites - Call Firebase FIRST
          await removeFromFavorites(
            auth.currentUser.uid,
            activeProfile.id,
            itemId,
            itemType
          );

          // Then update local state
          setFavorites((prevFavorites) => {
            const newFavorites = prevFavorites.filter(
              (f) => !(f.itemId === itemId && f.itemType === itemType)
            );

            return newFavorites;
          });

          setFavoritesMap((prevMap) => {
            const newMap = new Map(prevMap);
            newMap.delete(key);
            return newMap;
          });
        } else {
          // Add to favorites - optimistic update
          const newMap = new Map(favoritesMap);
          newMap.set(key, true);
          setFavoritesMap(newMap);

          const itemData = {
            title: itemType === "movie" ? item.title : item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date:
              itemType === "movie" ? item.release_date : item.first_air_date,
          };

          const success = await addToFavorites(
            auth.currentUser.uid,
            activeProfile.id,
            itemId,
            itemType,
            itemData
          );

          if (success) {
            // Reload favorites to get the new one with its Firestore ID
            await loadFavorites();
          } else {
            // Revert on failure
            const revertMap = new Map(favoritesMap);
            revertMap.delete(key);
            setFavoritesMap(revertMap);
          }
        }
        return true;
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // On error, reload to ensure sync
        await loadFavorites();
        return false;
      }
    },
    [activeProfile, favorites.length, favoritesMap, loadFavorites]
  );

  const value = {
    favorites,
    isFavorited,
    toggleFavorite,
    loading,
    refreshFavorites: loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
