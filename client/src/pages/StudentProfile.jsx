import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function StudentProfile() {
  const { userId } = useParams();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://skillswap-backend-jjao.onrender.com/api/skills")
      .then((response) => response.json())
      .then((data) => {
        const studentSkills = data.filter(
          (skill) => skill.userId?.toString() === userId
        );

        setSkills(studentSkills);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching student profile:", error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="student-profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="student-profile-page">
        <h1>Student Profile</h1>
        <p>No skill information found for this student.</p>

        <Link to="/browse">
          <button className="back-button">
            Back to Browse Skills
          </button>
        </Link>
      </div>
    );
  }

  const student = skills[0];

  return (
    <div className="student-profile-page">

      <div className="student-profile-card">

        <div className="student-profile-avatar">
          {student.studentName.charAt(0).toUpperCase()}
        </div>

        <h1>{student.studentName}</h1>

        <p className="student-profile-subtitle">
          {student.department} • {student.year}
        </p>

        <div className="student-profile-details">

          <div className="profile-info-box">
            <span>Department</span>
            <strong>{student.department}</strong>
          </div>

          <div className="profile-info-box">
            <span>Year</span>
            <strong>{student.year}</strong>
          </div>

          <div className="profile-info-box">
            <span>Experience</span>
            <strong>{student.experienceLevel}</strong>
          </div>

          <div className="profile-info-box">
            <span>Preferred Mode</span>
            <strong>{student.preferredMode}</strong>
          </div>

        </div>

      </div>

      <div className="student-skills-section">

        <h2>Skills Offered</h2>

        {skills.map((skill) => (
          <div
            className="student-skill-card"
            key={skill._id}
          >

            <div className="student-skill-row">

              <div>
                <span>I can teach</span>
                <h3>{skill.teachSkill}</h3>
              </div>

              <div>
                <span>I want to learn</span>
                <h3>{skill.learnSkill}</h3>
              </div>

            </div>

            <p>
              <strong>Category:</strong>{" "}
              {skill.category}
            </p>

            <p className="student-description">
              {skill.description}
            </p>

          </div>
        ))}

      </div>

      <Link to="/browse">
        <button className="back-button">
          Back to Browse Skills
        </button>
      </Link>

    </div>
  );
}

export default StudentProfile;