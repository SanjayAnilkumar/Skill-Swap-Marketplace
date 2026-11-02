import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseSkills from "./pages/BrowseSkills";
import AddSkill from "./pages/AddSkill";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Sessions from "./pages/Sessions";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Public Pages */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

<Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/browse"
          element={<BrowseSkills />}
        />

        {/* Protected Pages */}

        <Route
          path="/add-skill"
          element={
            <ProtectedRoute>
              <AddSkill />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          }
        />

        {/* Student Profile */}

        <Route
          path="/student/:userId"
          element={<StudentProfile />}
        />
        <Route
  path="/chat/:userId"
  element={
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;