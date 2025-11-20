import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { auth, addProfile } from "../../firebase";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import "./Profiles.css";
import { avatars } from "../../assets/Avatars";

const Profiles = () => {
  const { profiles, setActiveProfile, loading, refreshProfiles } = useProfile();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(profiles.length > 0 && !loading);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Preload all avatar images
  useEffect(() => {
    Object.values(avatars).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Only show content when profiles are loaded
  useEffect(() => {
    if (profiles.length > 0 && !loading) {
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    } else {
      setIsReady(false);
    }
  }, [profiles, loading]);

  const handleProfileSelect = (profile) => {
    setActiveProfile(profile);
    navigate("/home");
  };

  const handleAddProfile = () => {
    setShowModal(true);
  };

  const handleManageProfiles = () => {
    navigate("/manage-profiles", { state: { from: "/profiles" } });
  };

  const handleSaveProfile = async (profileData) => {
    setModalLoading(true);
    const newProfile = await addProfile(auth.currentUser.uid, profileData);

    if (newProfile) {
      // Refresh profiles to update the state
      await refreshProfiles();
      setShowModal(false);

      // Auto-select the new profile and navigate to home
      if (newProfile && newProfile.id) {
        setActiveProfile(newProfile);
        navigate("/home");
      }
    }

    setModalLoading(false);
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  if (loading || !isReady) {
    return (
      <div className="profiles">
        <h1>Loading Profiles...</h1>
      </div>
    );
  }

  return (
    <div className="profiles">
      <h1>Who's Watching?</h1>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="profile-card"
            onClick={() => handleProfileSelect(profile)}
          >
            <img
              src={avatars[profile.avatar] || Object.values(avatars)[1]}
              alt={profile.name}
              className="profile-avatar"
              loading="eager"
            />
            <p>{profile.name}</p>
          </div>
        ))}
        {profiles.length < 5 && (
          <div className="profile-card" onClick={handleAddProfile}>
            <img
              src={Object.values(avatars)[5]}
              alt="Add Profile"
              className="profile-avatar"
              loading="eager"
            />
            <p>Add Profile</p>
          </div>
        )}
      </div>

      {/* Manage Profiles Button */}
      <button onClick={handleManageProfiles} className="manage-profiles-button">
        Manage Profiles
      </button>

      {/* Add Profile Modal */}
      {showModal && (
        <ProfileModal
          profile={{
            id: "new",
            name: "",
            avatar: "avatar1.png",
            isKids: false,
          }}
          onSave={handleSaveProfile}
          onCancel={handleCancelModal}
          loading={modalLoading}
        />
      )}
    </div>
  );
};

export default Profiles;
