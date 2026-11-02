
import { useEffect, useState } from "react";
import "./Profile.css";

const API = "https://skillswap-backend-jjao.onrender.com/api/skills";
const PROFILE_API = "https://skillswap-backend-jjao.onrender.com/api/auth/profile";

function Profile() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [error, setError] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
const [savingProfile, setSavingProfile] = useState(false);
const [profileMessage, setProfileMessage] = useState("");

const [profileForm, setProfileForm] = useState({
  name: "",
  department: "",
  year: "",
  bio: "",
  profilePicture: "",
});

  const emptyForm = {
    teachSkill: "",
    learnSkill: "",
    category: "Programming",
    experienceLevel: "Beginner",
    description: "",
    preferredMode: "Online",
  };

  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoadingSkills(true);
      setError("");

      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          if (!cancelled) setUser(null);
          return;
        }

        const loggedInUser = JSON.parse(savedUser);

        if (!cancelled) {
          setUser(loggedInUser);
           setProfileForm({
    name: loggedInUser.name || "",
    department: loggedInUser.department || "",
    year: loggedInUser.year || "",
    bio: loggedInUser.bio || "",
    profilePicture: loggedInUser.profilePicture || "",
  });
}
        const response = await fetch(API);
        if (!response.ok) {
          throw new Error("Could not load your skills.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected skills data from the server.");
        }

        const userId = String(
          loggedInUser.id ?? loggedInUser._id ?? ""
        );

        const mySkills = data.filter((skill) => {
          const skillUserId =
            skill.userId?._id ??
            skill.userId?.id ??
            skill.userId;

          return String(skillUserId ?? "") === userId;
        });

        if (!cancelled) setSkills(mySkills);
      } catch (err) {
        console.error("Profile loading error:", err);
        if (!cancelled) {
          setError(err.message || "Unable to load your profile.");
        }
      } finally {
        if (!cancelled) setLoadingSkills(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  
const handleProfileChange = (event) => {
  const { name, value } = event.target;

  setProfileForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const saveProfile = async (event) => {
  event.preventDefault();
  setProfileMessage("");

  if (
    !profileForm.name.trim() ||
    !profileForm.department.trim() ||
    !profileForm.year.trim()
  ) {
    setProfileMessage("Name, department, and year are required.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setProfileMessage(
      "Your login token is missing. Please log out and log in again."
    );
    return;
  }

  setSavingProfile(true);

  try {
    const response = await fetch(PROFILE_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: profileForm.name.trim(),
        department: profileForm.department.trim(),
        year: profileForm.year.trim(),
        bio: profileForm.bio.trim(),
        profilePicture: profileForm.profilePicture.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update your profile.");
    }

    const updatedUser = {
      ...user,
      ...data.user,
      id: user.id || data.user._id,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditingProfile(false);
    setProfileMessage("Profile updated successfully!");
  } catch (err) {
    console.error("Profile update error:", err);
    setProfileMessage(err.message || "Unable to save your profile.");
  } finally {
    setSavingProfile(false);
  }
};

  const startEditing = (skill) => {
    setEditingSkill(skill._id);

    setEditForm({
      teachSkill: skill.teachSkill ?? "",
      learnSkill: skill.learnSkill ?? "",
      category: skill.category || "Programming",
      experienceLevel: skill.experienceLevel || "Beginner",
      description: skill.description ?? "",
      preferredMode: skill.preferredMode || "Online",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateSkill = async (skillId) => {
    if (!editForm.teachSkill.trim() || !editForm.learnSkill.trim()) {
      alert("Please enter both skills.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          teachSkill: editForm.teachSkill.trim(),
          learnSkill: editForm.learnSkill.trim(),
          description: editForm.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update skill.");
      }

      const updatedSkill = data.skill ?? data;

      setSkills((previous) =>
        previous.map((skill) =>
          skill._id === skillId ? updatedSkill : skill
        )
      );

      setEditingSkill(null);
    } catch (err) {
      console.error("Skill update error:", err);
      alert(err.message || "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    setDeletingSkill(skillId);

    try {
      const response = await fetch(`${API}/${skillId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete skill.");
      }

      setSkills((previous) =>
        previous.filter((skill) => skill._id !== skillId)
      );

      if (editingSkill === skillId) setEditingSkill(null);
    } catch (err) {
      console.error("Skill deletion error:", err);
      alert(err.message || "Unable to connect to the server.");
    } finally {
      setDeletingSkill(null);
    }
  };

  const offeredCount = skills.filter(
    (skill) => skill.teachSkill?.trim()
  ).length;

  const wantedCount = skills.filter(
    (skill) => skill.learnSkill?.trim()
  ).length;

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-message">
          <div className="profile-message-icon">👋</div>
          <h1>Welcome to Skill Swap</h1>
          <p>Please log in to view your profile and manage your skills.</p>
        </section>
      </main>
    );
  }

  const initial = (user.name || "S").charAt(0).toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <div>
            <span className="profile-eyebrow">YOUR SPACE</span>
            <h1>My Profile</h1>
            <p>Share what you know. Discover what you can learn.</p>
          </div>
          <span className="profile-heading-icon" aria-hidden="true">
            ✨
          </span>
        </header>

        <section className="profile-hero">
          <div className="profile-hero-top">
            <div className="profile-avatar">
  {user.profilePicture ? (
    <img
      src={user.profilePicture}
      alt={`${user.name || "Student"}'s profile`}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    initial
  )}
</div>

            <div className="profile-identity">
              <span className="profile-member-label">
                SKILL SWAP MEMBER
              </span>
              <h2>{user.name || "Student"}</h2>
              <p>{user.email || "Email not provided"}</p>
            </div>
          </div>

          <p className="profile-intro">
            {user.bio ||
    "Every skill is worth sharing. Connect with fellow students, exchange knowledge, and keep growing."}
          </p>

          <div className="profile-details">
            <div className="profile-detail">
              <span className="detail-icon">🎓</span>
              <div>
                <span>Department</span>
                <strong>{user.department || "Not added"}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <span className="detail-icon">📚</span>
              <div>
                <span>Academic year</span>
                <strong>{user.year || "Not added"}</strong>
              </div>
            </div>
          </div>
        </section>

        
<section className="edit-profile-section">
  <div className="edit-profile-heading">
    <div>
      <span className="profile-eyebrow">YOUR INFORMATION</span>
      <h2>Edit Profile</h2>
      <p>Tell other students a little more about yourself.</p>
    </div>

    {!editingProfile && (
      <button
        type="button"
        className="edit-skill-button"
        onClick={() => {
          setProfileForm({
            name: user.name || "",
            department: user.department || "",
            year: user.year || "",
            bio: user.bio || "",
            profilePicture: user.profilePicture || "",
          });
          setProfileMessage("");
          setEditingProfile(true);
        }}
      >
        ✏️ Edit Profile
      </button>
    )}
  </div>

  {profileMessage && (
    <p role="status" className="profile-feedback">
      {profileMessage}
    </p>
  )}

  {editingProfile && (
    <form className="profile-edit-form" onSubmit={saveProfile}>
      <div className="profile-edit-grid">
        <label>
          Full name
          <input
            name="name"
            value={profileForm.name}
            onChange={handleProfileChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Department
          <input
            name="department"
            value={profileForm.department}
            onChange={handleProfileChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          Academic year
          <select
            name="year"
            value={profileForm.year}
            onChange={handleProfileChange}
            required
          >
            <option value="">Select year</option>
            {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Profile picture URL
          <input
            type="url"
            name="profilePicture"
            value={profileForm.profilePicture}
            onChange={handleProfileChange}
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <label className="profile-edit-full">
          About me
          <textarea
            name="bio"
            value={profileForm.bio}
            onChange={handleProfileChange}
            maxLength={300}
            rows={4}
            placeholder="Tell others what you're interested in..."
          />
          <small>{profileForm.bio.length}/300 characters</small>
        </label>
      </div>

      <div className="edit-buttons">
        <button
          type="submit"
          className="save-edit-button"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>

        <button
          type="button"
          className="cancel-edit-button"
          disabled={savingProfile}
          onClick={() => {
            setEditingProfile(false);
            setProfileMessage("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</section>


        <section className="profile-stats">
          <article className="profile-stat">
            <span className="stat-icon offered-icon">↗</span>
            <div>
              <strong>{offeredCount}</strong>
              <span>Skills to teach</span>
            </div>
          </article>

          <article className="profile-stat">
            <span className="stat-icon wanted-icon">✦</span>
            <div>
              <strong>{wantedCount}</strong>
              <span>Skills to learn</span>
            </div>
          </article>

          <article className="profile-stat">
            <span className="stat-icon listings-icon">▤</span>
            <div>
              <strong>{skills.length}</strong>
              <span>Total listings</span>
            </div>
          </article>
        </section>

        <section className="my-skills-section">
          <div className="skills-section-heading">
            <div>
              <span className="profile-eyebrow">YOUR KNOWLEDGE</span>
              <h2>My Skills</h2>
              <p>Manage the skills you offer and want to learn.</p>
            </div>
            <span className="skills-heading-icon" aria-hidden="true">
              💡
            </span>
          </div>

          {loadingSkills ? (
            <div className="profile-message">
              <div className="profile-spinner" />
              <p>Loading your skills...</p>
            </div>
          ) : error ? (
            <div className="profile-message profile-error">
              <div className="profile-message-icon">⚠️</div>
              <h3>Couldn't load your skills</h3>
              <p>{error}</p>
              <p>Check that your backend is running and try refreshing.</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="profile-message">
              <div className="profile-message-icon">🌱</div>
              <h3>Your learning journey starts here</h3>
              <p>
                You haven't added any skills yet. Add your first skill
                through your existing skill creation page.
              </p>
            </div>
          ) : (
            <div className="my-skills-list">
              {skills.map((skill) => (
                <article className="my-skill-card" key={skill._id}>
                  {editingSkill === skill._id ? (
                    <form
                      className="edit-skill-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateSkill(skill._id);
                      }}
                    >
                      <div className="edit-form-heading">
                        <div>
                          <span className="profile-eyebrow">
                            UPDATE LISTING
                          </span>
                          <h3>Edit your skill</h3>
                        </div>
                        <span aria-hidden="true">✏️</span>
                      </div>

                      <div className="edit-form-grid">
                        <label>
                          Skill I can teach
                          <input
                            name="teachSkill"
                            value={editForm.teachSkill}
                            onChange={handleEditChange}
                            required
                          />
                        </label>

                        <label>
                          Skill I want to learn
                          <input
                            name="learnSkill"
                            value={editForm.learnSkill}
                            onChange={handleEditChange}
                            required
                          />
                        </label>

                        <label>
                          Category
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                          >
                            {[
                              "Programming",
                              "Design",
                              "Data",
                              "Electronics",
                              "Communication",
                              "Languages",
                              "Other",
                            ].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Experience level
                          <select
                            name="experienceLevel"
                            value={editForm.experienceLevel}
                            onChange={handleEditChange}
                          >
                            {["Beginner", "Intermediate", "Advanced"].map(
                              (option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label className="edit-full-width">
                          Description
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            rows={3}
                            placeholder="Describe what you can teach or want to learn..."
                          />
                        </label>

                        <label className="edit-full-width">
                          Preferred mode
                          <select
                            name="preferredMode"
                            value={editForm.preferredMode}
                            onChange={handleEditChange}
                          >
                            {["Online", "Offline", "Both"].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="edit-buttons">
                        <button
                          className="save-edit-button"
                          type="submit"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          className="cancel-edit-button"
                          type="button"
                          onClick={() => setEditingSkill(null)}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="skill-card-top">
                        <div className="skill-card-symbol">✦</div>
                        <div className="skill-card-title">
                          <h3>{skill.teachSkill || "Untitled skill"}</h3>
                          <span className="skill-category">
                            {skill.category || "Other"}
                          </span>
                        </div>
                        <span className="skill-level">
                          {skill.experienceLevel || "Not specified"}
                        </span>
                      </div>

                      <div className="skill-exchange">
                        <div className="exchange-item">
                          <span className="exchange-label">
                            <span className="exchange-arrow">↗</span>
                            I CAN TEACH
                          </span>
                          <strong>{skill.teachSkill || "Not specified"}</strong>
                        </div>

                        <div className="exchange-item">
                          <span className="exchange-label">
                            <span className="exchange-arrow learn-arrow">
                              ↙
                            </span>
                            I WANT TO LEARN
                          </span>
                          <strong>{skill.learnSkill || "Not specified"}</strong>
                        </div>
                      </div>

                      {skill.description && (
                        <p className="my-skill-description">
                          {skill.description}
                        </p>
                      )}

                      <div className="skill-card-footer">
                        <span className="skill-mode">
                          <span aria-hidden="true">◉</span>
                          {skill.preferredMode || "Mode not specified"}
                        </span>

                        <div className="skill-action-buttons">
                          <button
                            className="edit-skill-button"
                            type="button"
                            onClick={() => startEditing(skill)}
                            disabled={deletingSkill === skill._id}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-skill-button"
                            type="button"
                            onClick={() => deleteSkill(skill._id)}
                            disabled={deletingSkill === skill._id}
                          >
                            {deletingSkill === skill._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
