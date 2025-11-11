import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Create user document with the user's UID as the document ID
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });

    // Create two default profiles in the correct subcollection path
    const profilesRef = collection(db, "users", user.uid, "profiles");

    const profile1Ref = await addDoc(profilesRef, {
      name: name,
      avatar: "avatar2.png",
      isKids: false,
      watchlist: [],
      viewingHistory: [],
    });

    const profile2Ref = await addDoc(profilesRef, {
      name: "Kids",
      avatar: "avatar5.png",
      isKids: true,
      watchlist: [],
      viewingHistory: [],
    });

    // Return the created profiles with their IDs - Adult profile first
    const createdProfiles = [
      {
        id: profile1Ref.id,
        name: name,
        avatar: "avatar2.png",
        isKids: false,
        watchlist: [],
        viewingHistory: [],
      },
      {
        id: profile2Ref.id,
        name: "Kids",
        avatar: "avatar5.png",
        isKids: true,
        watchlist: [],
        viewingHistory: [],
      },
    ];

    toast.success("Account and default profiles created!");
    return { success: true, profiles: createdProfiles };
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
    return { success: false, profiles: [] };
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Logged in successfully!");
    return { success: true };
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
    return { success: false };
  }
};

const logout = () => {
  signOut(auth);
  toast.success("Logged out successfully!");
};

const getProfiles = async (uid) => {
  try {
    const profilesRef = collection(db, "users", uid, "profiles");
    const profilesSnapshot = await getDocs(profilesRef);
    const profiles = profilesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort profiles: non-kids profiles first, then kids profiles
    return profiles.sort((a, b) => {
      if (a.isKids === b.isKids) return 0;
      return a.isKids ? 1 : -1; // Non-kids (false) comes before kids (true)
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch profiles");
    return [];
  }
};

const addProfile = async (uid, profileData) => {
  try {
    const profiles = await getProfiles(uid);
    if (profiles.length >= 5) {
      toast.error("Maximum 5 profiles allowed");
      return false;
    }

    const profilesRef = collection(db, "users", uid, "profiles");
    const docRef = await addDoc(profilesRef, {
      ...profileData,
      watchlist: [],
      viewingHistory: [],
    });

    toast.success("Profile created successfully!");

    // Return the new profile with its ID
    return {
      id: docRef.id,
      ...profileData,
      watchlist: [],
      viewingHistory: [],
    };
  } catch (error) {
    console.error(error);
    toast.error("Failed to create profile");
    return false;
  }
};

const updateProfile = async (uid, profileId, profileData) => {
  try {
    const profileRef = doc(db, "users", uid, "profiles", profileId);
    await updateDoc(profileRef, profileData);
    toast.success("Profile updated successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to update profile");
  }
};

const deleteProfile = async (uid, profileId) => {
  try {
    const profiles = await getProfiles(uid);
    if (profiles.length <= 1) {
      toast.error("Cannot delete the last profile");
      return false;
    }

    const profileRef = doc(db, "users", uid, "profiles", profileId);
    await deleteDoc(profileRef);
    toast.success("Profile deleted successfully!");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete profile");
    return false;
  }
};

// Favorites functions
const addToFavorites = async (
  uid,
  profileId,
  itemId,
  itemType,
  itemData = {}
) => {
  try {
    const favoritesRef = collection(
      db,
      "users",
      uid,
      "profiles",
      profileId,
      "favorites"
    );

    // Check if already favorited
    const existingFav = await getDocs(
      query(
        favoritesRef,
        where("itemId", "==", itemId),
        where("itemType", "==", itemType)
      )
    );

    if (!existingFav.empty) {
      toast.info("Already in favorites");
      return false;
    }

    await addDoc(favoritesRef, {
      itemId,
      itemType, // 'movie' or 'tv'
      addedAt: new Date().toISOString(),
      ...itemData, // Optional: store some basic data for quick access
    });

    toast.success("Added to favorites!");
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    toast.error("Failed to add to favorites");
    return false;
  }
};

const removeFromFavorites = async (uid, profileId, itemId, itemType) => {
  try {
    const favoritesRef = collection(
      db,
      "users",
      uid,
      "profiles",
      profileId,
      "favorites"
    );

    const existingFav = await getDocs(
      query(
        favoritesRef,
        where("itemId", "==", itemId),
        where("itemType", "==", itemType)
      )
    );

    if (!existingFav.empty) {
      await deleteDoc(
        doc(
          db,
          "users",
          uid,
          "profiles",
          profileId,
          "favorites",
          existingFav.docs[0].id
        )
      );
      toast.success("Removed from favorites");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    toast.error("Failed to remove from favorites");
    return false;
  }
};

const getFavorites = async (uid, profileId) => {
  try {
    const favoritesRef = collection(
      db,
      "users",
      uid,
      "profiles",
      profileId,
      "favorites"
    );
    const favoritesSnapshot = await getDocs(favoritesRef);

    return favoritesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

const isItemFavorited = async (uid, profileId, itemId, itemType) => {
  try {
    const favoritesRef = collection(
      db,
      "users",
      uid,
      "profiles",
      profileId,
      "favorites"
    );

    const existingFav = await getDocs(
      query(
        favoritesRef,
        where("itemId", "==", itemId),
        where("itemType", "==", itemType)
      )
    );

    return !existingFav.empty;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

export {
  auth,
  db,
  login,
  signup,
  logout,
  getProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isItemFavorited,
};
