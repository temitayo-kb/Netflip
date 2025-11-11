import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { auth, getProfiles } from "../firebase";

const ProfileContext = createContext();

// Helper functions for session storage
const PROFILES_CACHE_KEY = "netflix_profiles_cache";
const ACTIVE_PROFILE_KEY = "netflix_active_profile";

const saveProfilesToCache = (profiles) => {
  try {
    sessionStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to cache profiles:", e);
  }
};

const getProfilesFromCache = () => {
  try {
    const cached = sessionStorage.getItem(PROFILES_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Failed to read cached profiles:", e);
    return null;
  }
};

const saveActiveProfileToCache = (profile) => {
  try {
    sessionStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to cache active profile:", e);
  }
};

const getActiveProfileFromCache = () => {
  try {
    const cached = sessionStorage.getItem(ACTIVE_PROFILE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Failed to read cached active profile:", e);
    return null;
  }
};

const clearProfilesCache = () => {
  try {
    sessionStorage.removeItem(PROFILES_CACHE_KEY);
    sessionStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch (e) {
    console.error("Failed to clear cache:", e);
  }
};

export const ProfileProvider = ({ children }) => {
  // Initialize from cache if available
  const cachedProfiles = getProfilesFromCache();
  const cachedActiveProfile = getActiveProfileFromCache();

  const [activeProfile, setActiveProfile] = useState(cachedActiveProfile);
  const [profiles, setProfiles] = useState(cachedProfiles || []);
  const [loading, setLoading] = useState(!cachedProfiles);
  const profilesSetManually = useRef(false);

  // Wrapper for setActiveProfile that also caches
  const setActiveProfileWithCache = useCallback((profile) => {
    setActiveProfile(profile);
    saveActiveProfileToCache(profile);
  }, []);

  // Function to manually set profiles (used after signup)
  const setProfilesDirectly = useCallback((newProfiles) => {
    setProfiles(newProfiles);
    saveProfilesToCache(newProfiles);
    profilesSetManually.current = true;
    if (newProfiles.length > 0) {
      const firstProfile = newProfiles[0];
      setActiveProfile(firstProfile);
      saveActiveProfileToCache(firstProfile);
    }
    setLoading(false); // Important: set loading to false immediately
  }, []);

  // Function to refresh profiles from Firestore
  const refreshProfiles = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      const userProfiles = await getProfiles(user.uid);
      setProfiles(userProfiles);
      saveProfilesToCache(userProfiles);

      // Update activeProfile using state setter to access current value
      setActiveProfile((currentProfile) => {
        if (
          currentProfile &&
          !userProfiles.find((p) => p.id === currentProfile.id)
        ) {
          // Profile was deleted
          saveActiveProfileToCache(null);
          return null;
        } else if (currentProfile) {
          // Update activeProfile with the refreshed data from Firestore
          const updatedActiveProfile = userProfiles.find(
            (p) => p.id === currentProfile.id
          );
          if (updatedActiveProfile) {
            saveActiveProfileToCache(updatedActiveProfile);
            return updatedActiveProfile;
          }
        }
        return currentProfile;
      });

      return userProfiles; // Return profiles so caller can use them immediately
    }
    return [];
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if we have cached profiles
        const cached = getProfilesFromCache();

        if (cached && cached.length > 0) {
          setProfiles(cached);
          setLoading(false);

          // Set active profile from cache if not already set
          if (!activeProfile) {
            const cachedActive = getActiveProfileFromCache();
            if (cachedActive) {
              // Verify cached active profile still exists in the profiles list
              const profileExists = cached.find(
                (p) => p.id === cachedActive.id
              );
              if (profileExists) {
                setActiveProfile(profileExists);
              } else {
                setActiveProfile(cached[0]);
                saveActiveProfileToCache(cached[0]);
              }
            } else if (cached.length > 0) {
              setActiveProfile(cached[0]);
              saveActiveProfileToCache(cached[0]);
            }
          }
          return;
        }

        // Skip fetch if profiles were manually set (after signup)
        if (profilesSetManually.current) {
          setLoading(false);
          return;
        }

        // Only fetch if profiles aren't already set
        if (profiles.length === 0) {
          setLoading(true);
          const userProfiles = await getProfiles(user.uid);
          setProfiles(userProfiles);
          saveProfilesToCache(userProfiles);

          if (userProfiles.length > 0 && !activeProfile) {
            setActiveProfile(userProfiles[0]);
            saveActiveProfileToCache(userProfiles[0]);
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        setProfiles([]);
        setActiveProfile(null);
        setLoading(false);
        profilesSetManually.current = false;
        clearProfilesCache();
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        setActiveProfile: setActiveProfileWithCache,
        profiles,
        setProfilesDirectly,
        refreshProfiles,
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
