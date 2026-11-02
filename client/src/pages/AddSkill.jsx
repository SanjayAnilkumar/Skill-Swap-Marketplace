import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AddSkill() {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    department: "",
    year: "",
    teachSkill: "",
    learnSkill: "",
    category: "",
    experienceLevel: "",
    description: "",
    preferredMode: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const loggedInUser = JSON.parse(savedUser);

      setUser(loggedInUser);

      setFormData((previousData) => ({
        ...previousData,
        studentName: loggedInUser.name,
        department: loggedInUser.department,
        year: loggedInUser.year,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first");
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    try {
      const response = await fetch(
       "https://skillswap-backend-jjao.onrender.com/api/skills", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            userId: loggedInUser.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Your skill has been published successfully!");

        setFormData({
          studentName: loggedInUser.name,
          department: loggedInUser.department,
          year: loggedInUser.year,
          teachSkill: "",
          learnSkill: "",
          category: "",
          experienceLevel: "",
          description: "",
          preferredMode: "",
        });
      } else {
        alert(data.message || "Failed to publish skill");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to the server");
    }
  };

  if (!user) {
    return (
      <div className="add-skill-page">
        <div className="add-skill-login-card">
          <div className="login-icon">🔐</div>

          <h1>Login Required</h1>

          <p>
            Please login to your SkillSwap account
            before adding a skill.
          </p>

          <Link to="/login">
            <button className="add-skill-login-button">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="add-skill-page">

      {/* ================= HEADER ================= */}

      <div className="add-skill-hero">

        <div className="add-skill-hero-content">

          <p className="add-skill-label">
            SHARE YOUR KNOWLEDGE
          </p>

          <h1>
            Add Your <span>Skill</span>
          </h1>

          <p className="add-skill-subtitle">
            Tell other students what you can teach
            <br />
            and what you would like to learn.
          </p>

        </div>

        <div className="add-skill-hero-visual">

          <div className="hero-idea-text">
            Small skills
            <br />
            create big
            <br />
            opportunities
          </div>

          <div className="hero-books">
            <div className="book book-blue"></div>
            <div className="book book-red"></div>
            <div className="book book-green"></div>

            <div className="light-bulb">
              💡
            </div>
          </div>

        </div>

      </div>


      {/* ================= MAIN CARD ================= */}

      <div className="add-skill-main-card">

        {/* ================= LEFT PANEL ================= */}

        <aside className="add-skill-sidebar">

          <div className="exchange-icon">
            ⇄
          </div>

          <h2>
            Exchange skills.
            <br />
            Learn together.
          </h2>

          <p className="sidebar-description">
            Create a skill listing and connect with
            students who are interested in learning
            from you.
          </p>


          <div className="sidebar-points">

            <div className="sidebar-point">
              <span>✓</span>
              <p>
                Share skills you are comfortable
                teaching
              </p>
            </div>

            <div className="sidebar-point">
              <span>✓</span>
              <p>
                Mention what you want to learn
              </p>
            </div>

            <div className="sidebar-point">
              <span>✓</span>
              <p>
                Connect with other students
              </p>
            </div>

          </div>


          <div className="skill-tip-box">

            <div className="tip-icon">
              💡
            </div>

            <div>
              <strong>Tip</strong>

              <p>
                Add a clear description so students
                can understand what they can learn
                from you.
              </p>
            </div>

          </div>


          <div className="sidebar-decoration">
            ◢
          </div>

        </aside>


        {/* ================= RIGHT FORM ================= */}

        <main className="add-skill-form-section">

          <div className="form-main-heading">

            <div>
              <h2>Skill Details</h2>

              <p>
                Fill in the details below to publish
                your skill.
              </p>
            </div>

            <div className="main-step-number">
              01
            </div>

          </div>


          <form
            className="new-skill-form"
            onSubmit={handleSubmit}
          >

            {/* ================= SECTION 01 ================= */}

            <div className="skill-form-section">

              <div className="section-heading-row">

                <div className="section-number">
                  01
                </div>

                <div>
                  <h3>Your Information</h3>

                  <p>
                    These details come from your account.
                  </p>
                </div>

              </div>


              <div className="form-grid-two">

                <div className="field-group">

                  <label>Student Name</label>

                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    readOnly
                  />

                </div>


                <div className="field-group">

                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    readOnly
                  />

                </div>

              </div>


              <div className="field-group">

                <label>Year</label>

                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  readOnly
                />

              </div>

            </div>


            {/* ================= SECTION 02 ================= */}

            <div className="skill-form-section">

              <div className="section-heading-row">

                <div className="section-number">
                  02
                </div>

                <div>
                  <h3>Skill Exchange</h3>

                  <p>
                    Tell us what you can teach and what
                    you want to learn.
                  </p>
                </div>

              </div>


              <div className="exchange-form-grid">

                {/* Teach */}

                <div className="skill-box teach-box">

                  <div className="skill-box-title">

                    <div className="skill-box-icon">
                      📖
                    </div>

                    <label>
                      Skill I Can Teach
                    </label>

                  </div>


                  <input
                    type="text"
                    name="teachSkill"
                    placeholder="Example: Java"
                    value={formData.teachSkill}
                    onChange={handleChange}
                    required
                  />

                  <small>
                    What skill can you share with others?
                  </small>

                </div>


                {/* Learn */}

                <div className="skill-box learn-box">

                  <div className="skill-box-title">

                    <div className="skill-box-icon">
                      🎯
                    </div>

                    <label>
                      Skill I Want to Learn
                    </label>

                  </div>


                  <input
                    type="text"
                    name="learnSkill"
                    placeholder="Example: Photography"
                    value={formData.learnSkill}
                    onChange={handleChange}
                    required
                  />

                  <small>
                    What skill would you like to learn?
                  </small>

                </div>

              </div>

            </div>


            {/* ================= SECTION 03 ================= */}

            <div className="skill-form-section">

              <div className="section-heading-row">

                <div className="section-number">
                  03
                </div>

                <div>
                  <h3>Additional Details</h3>

                  <p>
                    Help other students understand
                    your skill better.
                  </p>
                </div>

              </div>


              <div className="form-grid-two">

                <div className="field-group">

                  <label>Category</label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Category
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


                <div className="field-group">

                  <label>Experience Level</label>

                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Level
                    </option>

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                  </select>

                </div>

              </div>


              <div className="field-group">

                <label>Short Description</label>

                <textarea
                  name="description"
                  placeholder="Describe your skill, experience and what you're looking for..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength="500"
                  required
                ></textarea>

                <div className="textarea-bottom">
                  <span>
                    Add a clear description of your skill.
                  </span>

                  <span>
                    {formData.description.length}/500
                  </span>
                </div>

              </div>


              <div className="field-group">

                <label>
                  Preferred Learning Mode
                </label>

                <select
                  name="preferredMode"
                  value={formData.preferredMode}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Mode
                  </option>

                  <option value="Online">
                    Online
                  </option>

                  <option value="Offline">
                    Offline
                  </option>

                  <option value="Both">
                    Both Online & Offline
                  </option>

                </select>

              </div>

            </div>


            {/* ================= SUBMIT ================= */}

            <div className="publish-area">

              <button
                type="submit"
                className="publish-button"
              >
                <span>➤</span>
                Publish My Skill →
              </button>

              <p>
                🔒 Your information is safe and will
                only be visible to other students on
                SkillSwap.
              </p>

            </div>

          </form>

        </main>

      </div>

    </div>
  );
}

export default AddSkill;