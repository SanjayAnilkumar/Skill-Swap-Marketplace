import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setRequestCount(0);
      return;
    }

    const checkRequests = () => {
      fetch(
        `https://skillswap-backend-jjao.onrender.com/api/requests/${user.id}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const pendingRequests = data.filter(
              (request) =>
                request.receiver?._id === user.id &&
                request.status === "Pending"
            );

            setRequestCount(pendingRequests.length);
          }
        })
        .catch((error) => {
          console.error(
            "Error fetching request count:",
            error
          );
        });
    };

    checkRequests();

    const interval = setInterval(
      checkRequests,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setRequestCount(0);

    alert("Logged out successfully!");

    navigate("/login");
    window.location.reload();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/">
          Skill<span>Swap</span>
        </Link>
      </div>


      {/* Main Navigation */}
      <div className="navbar-links">

        <Link
          to="/"
          className={
            isActive("/")
              ? "nav-item active"
              : "nav-item"
          }
        >
          Home
        </Link>

        <Link
          to="/browse"
          className={
            isActive("/browse")
              ? "nav-item active"
              : "nav-item"
          }
        >
          Browse Skills
        </Link>

        <Link
          to="/requests"
          className={
            isActive("/requests")
              ? "nav-item active requests-nav-item"
              : "nav-item requests-nav-item"
          }
        >
          Requests

          {user && requestCount > 0 && (
            <span className="navbar-notification">
              {requestCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className={
            isActive("/profile")
              ? "nav-item active"
              : "nav-item"
          }
        >
          Profile
        </Link>
                <Link
          to="/sessions"
          className={
            location.pathname.startsWith("/sessions")
              ? "nav-item active"
              : "nav-item"
          }
        >
          Learning Sessions
        </Link>

      </div>


      {/* Right Side */}
      <div className="navbar-right">

        {user ? (
          <>

            {/* Notification */}
            <Link
              to="/requests"
              className="navbar-bell"
              title="Notifications"
            >
              🔔

              {requestCount > 0 && (
                <span className="bell-badge">
                  {requestCount}
                </span>
              )}
            </Link>


            {/* User */}
            <div className="navbar-user">

              <div className="navbar-avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <span className="navbar-user-name">
                Hi, {user.name}
              </span>

            </div>


            {/* Logout */}
            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>
        ) : (
          <>

            <Link
              to="/login"
              className="navbar-auth-button"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="navbar-auth-button"
            >
              Register
            </Link>

          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;