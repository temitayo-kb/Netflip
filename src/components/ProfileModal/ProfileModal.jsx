import React, { useState } from "react";
import "./ProfileModal.css";
import { avatars } from "../../assets/Avatars";

const ProfileModal = ({ profile, onSave, onCancel, onDelete, loading }) => {
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "avatar1.png");
  const [isKids, setIsKids] = useState(profile?.isKids || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isNewProfile = profile?.id === "new" || !profile?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, avatar, isKids });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(profile.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="edit-profile-modal">
          <h2>{isNewProfile ? "Add Profile" : "Edit Profile"}</h2>

          <div className="avatar-preview">
            <img
              src={avatars[avatar]}
              alt="Avatar preview"
              className={`preview-avatar ${isKids ? "kids-profile" : ""}`}
            />
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Profile Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength="20"
                className="name-input"
              />
            </div>

            <div className="form-group">
              <label className="section-label">Choose Avatar</label>
              <div className="avatar-grid">
                {Object.entries(avatars).map(([avatarKey, avatarSrc]) => (
                  <div
                    key={avatarKey}
                    className={`avatar-option ${
                      avatar === avatarKey ? "selected" : ""
                    }`}
                    onClick={() => setAvatar(avatarKey)}
                  >
                    <img src={avatarSrc} alt={`Avatar ${avatarKey}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="kids-toggle">
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Kids Profile</span>
              </label>
              <p className="kids-description">
                Kids profiles only show TV shows and movies for children.
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button" disabled={loading}>
                {loading
                  ? "Saving..."
                  : isNewProfile
                  ? "Create Profile"
                  : "Save"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              {!isNewProfile && onDelete && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDeleteClick}
                  disabled={loading}
                >
                  Delete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Profile?</h2>
            <p>
              This will permanently delete this profile and all its settings.
            </p>
            <div className="delete-actions">
              <button
                className="confirm-delete"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="cancel-delete"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
