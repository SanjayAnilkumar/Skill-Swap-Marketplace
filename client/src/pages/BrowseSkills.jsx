import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BrowseSkills() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  const savedUser = localStorage.getItem("user");
  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  // Fetch all skills
  useEffect(() => {
    fetch("https://skillswap-backend-jjao.onrender.com/api/skills")
      .then((response) => response.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
        setLoading(false);
      });
  }, []);

  // Find possible skill matches
  useEffect(() => {
    if (!currentUser || skills.length === 0) {
      setMatches([]);
      return;
    }

    const mySkills = skills.filter(
      (skill) =>
        skill.userId?.toString() === currentUser.id
    );

    const possibleMatches = skills.filter(
      (otherSkill) => {
        // Do not show your own skills as matches
        if (
          otherSkill.userId?.toString() ===
          currentUser.id
        ) {
          return false;
        }

        return mySkills.some(
          (mySkill) =>
            mySkill.teachSkill.toLowerCase() ===
              otherSkill.learnSkill.toLowerCase() &&
            mySkill.learnSkill.toLowerCase() ===
              otherSkill.teachSkill.toLowerCase()
        );
      }
    );

    // Remove duplicate students
    const uniqueMatches = possibleMatches.filter(
      (match, index, self) =>
        index ===
        self.findIndex(
          (item) =>
            item.userId?.toString() ===
            match.userId?.toString()
        )
    );

    setMatches(uniqueMatches);
  }, [skills, currentUser]);

  // Send swap request
  const sendRequest = async (skill) => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    if (
      skill.userId?.toString() ===
      currentUser.id
    ) {
      alert(
        "You cannot send a request to your own skill."
      );
      return;
    }

    try {
      const response = await fetch(
        "https://skillswap-backend-jjao.onrender.com/api/requests",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sender: currentUser.id,
            receiver: skill.userId,
            skillId: skill._id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Swap request sent successfully!");
      } else {
        alert(
          data.message ||
            "Failed to send request"
        );
      }
    } catch (error) {
      console.error("Error:", error);

      alert(
        "Unable to connect to the server"
      );
    }
  };

  // Search and category filter
  const filteredSkills = skills.filter((skill) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      skill.teachSkill
        .toLowerCase()
        .includes(searchText) ||
      skill.learnSkill
        .toLowerCase()
        .includes(searchText) ||
      skill.studentName
        .toLowerCase()
        .includes(searchText);

    const matchesCategory =
      category === "All" ||
      skill.category === category;

    return (
      matchesSearch &&
      matchesCategory
    );
  });

  return (
    <div className="browse-page">

      {/* Page Header */}
      <div className="browse-header">
        <h1>Find a Skill</h1>

        <p>
          Browse skills offered by other students
          and find someone to exchange skills with.
        </p>
      </div>

      {/* Possible Skill Matches */}
      {currentUser && matches.length > 0 && (
        <div className="match-section">

          <h2>
            🎯 Possible Skill Matches
          </h2>

          <p>
            Students whose skills match what
            you want to learn.
          </p>

          <div className="match-list">

            {matches.map((match) => (
              <div
                className="match-card"
                key={match._id}
              >

                <div className="student-info">

                  <div className="student-avatar">
                    {match.studentName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {match.studentName}
                    </h3>

                    <p>
                      {match.department} •{" "}
                      {match.year}
                    </p>
                  </div>

                </div>

                <div className="match-details">

                  <p>
                    <strong>
                      They can teach:
                    </strong>{" "}
                    {match.teachSkill}
                  </p>

                  <p>
                    <strong>
                      They want to learn:
                    </strong>{" "}
                    {match.learnSkill}
                  </p>

                </div>

                <div className="match-buttons">

                  {/* View Profile */}
                  {match.userId && (
                    <Link
                      to={`/student/${match.userId}`}
                      className="view-profile-link"
                    >
                      <button className="view-button">
                        View Profile
                      </button>
                    </Link>
                  )}

                  {/* Request Swap */}
                  <button
                    className="request-button"
                    onClick={() =>
                      sendRequest(match)
                    }
                  >
                    Request Swap
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* Search and Filter */}
      <div className="filters">

        <input
          type="text"
          placeholder="Search by skill or student name..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          <option value="All">
            All Categories
          </option>

          <option value="Programming">
            Programming
          </option>

          <option value="Design">
            Design
          </option>

          <option value="Data">
            Data
          </option>

          <option value="Electronics">
            Electronics
          </option>

          <option value="Communication">
            Communication
          </option>

          <option value="Languages">
            Languages
          </option>

          <option value="Other">
            Other
          </option>

        </select>

      </div>

      {/* Skill Count */}
      {loading ? (
        <p className="skill-count">
          Loading skills...
        </p>
      ) : (
        <p className="skill-count">
          {filteredSkills.length} skill
          listing(s) found
        </p>
      )}

      {/* Skill Cards */}
      <div className="skills-grid">

        {!loading &&
        filteredSkills.length > 0 ? (

          filteredSkills.map((skill) => (

            <div
              className="skill-card"
              key={skill._id}
            >

              {/* Student Information */}
              <div className="student-info">

                <div className="student-avatar">
                  {skill.studentName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3>
                    {skill.studentName}
                  </h3>

                  <p>
                    {skill.department} •{" "}
                    {skill.year}
                  </p>

                </div>

              </div>

              {/* Skill Details */}
              <div className="skill-details">

                <div>
                  <span>
                    I can teach
                  </span>

                  <strong>
                    {skill.teachSkill}
                  </strong>
                </div>

                <div>
                  <span>
                    I want to learn
                  </span>

                  <strong>
                    {skill.learnSkill}
                  </strong>
                </div>

              </div>

              {/* Experience */}
              <p className="experience">
                Level:{" "}
                {skill.experienceLevel}
              </p>

              {/* Description */}
              <p className="description">
                {skill.description}
              </p>

              {/* Buttons */}
              <div className="skill-card-buttons">

                {/* View Profile */}
                {skill.userId && (
                  <Link
                    to={`/student/${skill.userId}`}
                    className="view-profile-link"
                  >
                    <button className="view-button">
                      View Profile
                    </button>
                  </Link>
                )}

                {/* Request Swap */}
                {skill.userId &&
                  skill.userId.toString() !==
                    currentUser?.id && (

                    <button
                      className="request-button"
                      onClick={() =>
                        sendRequest(skill)
                      }
                    >
                      Request Swap
                    </button>

                  )}

              </div>

            </div>

          ))

        ) : !loading ? (

          <div className="no-results">

            <h3>
              No skills found
            </h3>

            <p>
              Try searching for another skill.
            </p>

          </div>

        ) : null}

      </div>

    </div>
  );
}

export default BrowseSkills;