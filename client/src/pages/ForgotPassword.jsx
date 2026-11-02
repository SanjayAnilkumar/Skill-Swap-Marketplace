
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process your request."
        );
      }

      setMessage(
        data.message ||
          "If an account exists with that email, a reset link has been sent."
      );
    } catch (err) {
      console.error("Forgot password request failed:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that your backend is running."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "28px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        Forgot Password?
      </h2>

      <p style={{ textAlign: "center", color: "#666" }}>
        Enter the email address you used to register
        your SkillSwap account.
      </p>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="reset-email"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Email address
        </label>

        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage("");
            setError("");
          }}
          placeholder="Enter your registered email"
          autoComplete="email"
          required
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: loading ? "#888" : "#2563eb",
            color: "white",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && (
        <p
          role="status"
          style={{ color: "green", marginTop: "18px" }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{ color: "red", marginTop: "18px" }}
        >
          {error}
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
