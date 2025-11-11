import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { auth, updateProfile, deleteProfile, addProfile } from "../../firebase";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import "./ManageProfiles.css";
import { avatars } from "../../assets/Avatars";
import edit_icon from "../../assets/edit_icon.svg";
import add_icon from "../../assets/add_icon.svg";

const ManageProfiles = () => {
  const { profiles, activeProfile, refreshProfiles } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [editProfile, setEditProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeProfile?.isKids) {
      navigate("/profiles");
    }
  }, [activeProfile?.isKids, navigate]);
  const handleSaveProfile = async (profileData) => {
    setLoading(true);

    if (editProfile.id === "new") {
      // Create new profile
      const success = await addProfile(auth.currentUser.uid, profileData);
      if (success) {
        await refreshProfiles();
      }
    } else {
      // Update existing profile
      await updateProfile(auth.currentUser.uid, editProfile.id, profileData);
      await refreshProfiles();
    }

    setLoading(false);
    setEditProfile(null);
  };

  const handleEdit = (profile) => {
    setEditProfile(profile);
  };

  const handleDelete = async (profileId) => {
    setLoading(true);
    const success = await deleteProfile(auth.currentUser.uid, profileId);
    if (success) {
      await refreshProfiles();
      if (activeProfile?.id === profileId) {
        navigate("/profiles");
      }
    }
    setLoading(false);
    setEditProfile(null);
  };

  const handleDone = () => {
    const fromRoute = location.state?.from;
    if (fromRoute) {
      navigate(fromRoute);
    } else if (activeProfile) {
      navigate("/home");
    } else {
      navigate("/profiles");
    }
  };

  const handleAddProfile = () => {
    setEditProfile({
      id: "new",
      name: "",
      avatar: "avatar1.png",
      isKids: false,
    });
  };

  const handleCancelEdit = () => {
    setEditProfile(null);
  };

  return (
    <div className="manage-profiles page-transition">
      <h1 className="manage-profiles-title">Manage Profiles</h1>

      <div className="profiles-grid">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="profile-card"
            onClick={() => handleEdit(profile)}
          >
            <div className="profile-avatar-container">
              <img
                src={avatars[profile.avatar]}
                alt={profile.name}
                className={`profile-avatar ${
                  profile.isKids ? "kids-profile" : ""
                }`}
              />
              <div className="edit-overlay">
                <img src={edit_icon} alt="Edit" className="edit-icon" />
              </div>
            </div>
            <p className="profile-name">{profile.name}</p>
          </div>
        ))}

        {/* Add Profile Card */}
        {profiles.length < 5 && (
          <div className="profile-card add-profile" onClick={handleAddProfile}>
            <div className="profile-avatar-container">
              <div className="add-profile-avatar">
                <img src={add_icon} alt="Add Profile" className="add-icon" />
              </div>
            </div>
            <p className="profile-name">Add Profile</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {editProfile && (
        <ProfileModal
          profile={editProfile}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          onDelete={editProfile.id !== "new" ? handleDelete : null}
          loading={loading}
        />
      )}

      {/* Done Button */}
      <button onClick={handleDone} className="done-button">
        Done
      </button>
    </div>
  );
};

export default ManageProfiles;
