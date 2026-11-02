import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const [skillCount, setSkillCount] = useState(0);
  const [mySkillCount, setMySkillCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return;
    }

    const loggedInUser = JSON.parse(savedUser);
    setUser(loggedInUser);

    // Fetch skills
    fetch("https://skillswap-backend-jjao.onrender.com/api/skills")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSkillCount(data.length);

          const mySkills = data.filter(
            (skill) =>
              skill.userId?.toString() === loggedInUser.id
          );

          setMySkillCount(mySkills.length);
        }
      })
      .catch((error) => {
        console.error("Error fetching skills:", error);
      });

    // Fetch requests
    fetch(
      `https://skillswap-backend-jjao.onrender.com/api/requests/${loggedInUser.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pending = data.filter(
            (request) =>
              request.receiver?._id === loggedInUser.id &&
              request.status === "Pending"
          );

          const accepted = data.filter(
            (request) =>
              (
                request.sender?._id === loggedInUser.id ||
                request.receiver?._id === loggedInUser.id
              ) &&
              request.status === "Accepted"
          );

          setPendingCount(pending.length);
          setAcceptedCount(accepted.length);
        }
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  }, []);

  return (
    <div className="home">

      {/* ================= HERO ================= */}
      <section className="home-hero">

        <div className="home-hero-content">

          {/* Left side */}
          <div className="home-hero-text">

            <p className="home-hero-label">
              STUDENT SKILL EXCHANGE PLATFORM
            </p>

            <h1>
              Learn. Teach.
              <br />
              <span>Exchange.</span>
            </h1>

            <p className="home-hero-description">
              Share what you know, discover new skills,
              and connect with students who can help you learn.
            </p>

            <div className="home-hero-buttons">

              <Link to="/browse">
                <button className="home-primary-button">
                  🔍 &nbsp; Browse Skills
                </button>
              </Link>

              <Link to="/add-skill">
                <button className="home-secondary-button">
                  ＋ &nbsp; Add Your Skill
                </button>
              </Link>

            </div>

          </div>

          {/* Center visual */}
          <div className="skill-exchange-visual">

            <div className="student-circle student-one">
              👩🏻‍💻
            </div>

            <div className="exchange-arrow arrow-one">
              →
            </div>

            <div className="student-circle student-two">
              👨🏻‍💻
            </div>

            <div className="exchange-arrow arrow-two">
              ←
            </div>

            <div className="exchange-text">
              Better Skills
              <br />
              Together
            </div>

          </div>

          {/* Right card */}
          <div className="home-hero-card">

            <div className="hero-card-icon">
              ⇄
            </div>

            <h2>
              Skills are better when
              <br />
              shared.
            </h2>

            <p>
              Find students who can teach what you
              want to learn while sharing your own
              knowledge.
            </p>

            <div className="hero-card-stats">

              <div>
                <span>🎓</span>
                <strong>Learn</strong>
                <small>New Skills</small>
              </div>

              <div>
                <span>👥</span>
                <strong>Teach</strong>
                <small>Your Skills</small>
              </div>

              <div>
                <span>🔗</span>
                <strong>Connect</strong>
                <small>With Students</small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="home-features">

        <div className="home-feature-card">

          <div className="feature-icon purple">
            📖
          </div>

          <div>
            <h3>Share Your Skills</h3>
            <p>
              List the skills you are comfortable teaching.
            </p>
          </div>

        </div>


        <div className="home-feature-card">

          <div className="feature-icon green">
            🔍
          </div>

          <div>
            <h3>Find Skills</h3>
            <p>
              Search for skills offered by other students.
            </p>
          </div>

        </div>


        <div className="home-feature-card">

          <div className="feature-icon pink">
            🎯
          </div>

          <div>
            <h3>Find Matches</h3>
            <p>
              Discover students with complementary skills.
            </p>
          </div>

        </div>


        <div className="home-feature-card">

          <div className="feature-icon orange">
            💬
          </div>

          <div>
            <h3>Connect & Learn</h3>
            <p>
              Request a swap and chat after it is accepted.
            </p>
          </div>

        </div>

      </section>


      {/* ================= DASHBOARD ================= */}
      {user && (
        <section className="home-dashboard">

          <div className="dashboard-intro">

            <p className="home-section-label">
              YOUR ACTIVITY
            </p>

            <h2>
              Welcome back, {user.name}!
            </h2>

            <p>
              Here's a quick overview of your SkillSwap activity.
            </p>

            <Link to="/profile">
              <button className="dashboard-profile-button">
                👤 &nbsp; View Profile
              </button>
            </Link>

          </div>


          <div className="dashboard-stat-area">

            <div className="dashboard-stat blue-stat">
              <span className="dashboard-icon">
                📚
              </span>

              <strong>
                {skillCount}
              </strong>

              <p>
                Skills Available
              </p>
            </div>


            <div className="dashboard-stat green-stat">
              <span className="dashboard-icon">
                👤
              </span>

              <strong>
                {mySkillCount}
              </strong>

              <p>
                My Skills
              </p>
            </div>


            <div className="dashboard-stat pink-stat">
              <span className="dashboard-icon">
                🔔
              </span>

              <strong>
                {pendingCount}
              </strong>

              <p>
                Pending Requests
              </p>
            </div>


            <div className="dashboard-stat purple-stat">
              <span className="dashboard-icon">
                🤝
              </span>

              <strong>
                {acceptedCount}
              </strong>

              <p>
                Accepted Swaps
              </p>
            </div>

          </div>


          <div className="dashboard-actions">

            <Link to="/browse">
              <button>
                🔍 &nbsp; Find Skills
              </button>
            </Link>

            <Link to="/requests">
              <button>
                🔔 &nbsp; View Requests
              </button>
            </Link>

            <Link to="/add-skill">
              <button>
                ＋ &nbsp; Add Skill
              </button>
            </Link>

          </div>

        </section>
      )}


      {/* ================= HOW IT WORKS ================= */}
      <section className="home-how">

        <div className="home-how-heading">

          <p className="home-section-label">
            SIMPLE PROCESS
          </p>

          <h2>
            How SkillSwap Works
          </h2>

          <p>
            Exchange knowledge with other students in just a few steps.
          </p>

        </div>


        <div className="home-steps">

          <div className="home-step">

            <div className="step-number">
              01
            </div>

            <div>
              <h3>
                Create Your Profile
              </h3>

              <p>
                Register and add the skills you can
                teach and want to learn.
              </p>
            </div>

          </div>


          <div className="home-step">

            <div className="step-number">
              02
            </div>

            <div>
              <h3>
                Browse Skills
              </h3>

              <p>
                Search and explore skills offered
                by other students.
              </p>
            </div>

          </div>


          <div className="home-step">

            <div className="step-number">
              03
            </div>

            <div>
              <h3>
                Request a Swap
              </h3>

              <p>
                Send a request to a student whose
                skills match your needs.
              </p>
            </div>

          </div>


          <div className="home-step">

            <div className="step-number">
              04
            </div>

            <div>
              <h3>
                Connect & Learn
              </h3>

              <p>
                Once accepted, chat with the student
                and start exchanging skills.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="home-bottom-cta">

        <div>

          <p>
            START SHARING TODAY
          </p>

          <h2>
            Have a skill to share?
          </h2>

          <span>
            Add your skill and help another student learn something new.
          </span>

        </div>

        <Link to="/add-skill">
          <button>
            Add Your Skill →
          </button>
        </Link>

      </section>

    </div>
  );
}

export default Home;