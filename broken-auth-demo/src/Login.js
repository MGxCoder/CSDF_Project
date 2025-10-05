import React, { useState, useEffect } from "react";
import RegisterPage from "./RegisterPage";
import "./HackerTheme.css";

function Login() {
  const [input, setInput] = useState({ username: "", password: "" });
  const [status, setStatus] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (loading) {
      const dots = [".", "..", "..."];
      let i = 0;
      const interval = setInterval(() => {
        setStatus(`AUTHENTICATING${dots[i]}`);
        i = (i + 1) % dots.length;
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!input.username || !input.password) {
        setStatus("ERROR: ALL FIELDS REQUIRED");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        mode: 'cors', // Add this line
        body: JSON.stringify(input)
      });

      const data = await res.json();

      if (data.success) {
        setStatus("ACCESS GRANTED");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus("INITIALIZING SYSTEM...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus(`WELCOME TO THE SYSTEM, ${input.username.toUpperCase()}`);
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
      } else {
        setStatus("ACCESS DENIED: INVALID CREDENTIALS");
      }
    } catch (error) {
      console.error("Login error:", error);
      setStatus("CONNECTION FAILED: SERVER UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setInput({ username: "", password: "" });
    setStatus(null);
  };

  if (showRegister) {
    return <RegisterPage switchToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="hacker-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="terminal-title">SECURE SYSTEM ACCESS v1.0</span>
        </div>
        <div className="terminal-body">
          <div className="terminal-text">
           <p>{'>>>'} INITIALIZING SECURITY PROTOCOL...</p>
           <p>{'>>>'}ENTER CREDENTIALS TO PROCEED</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>USERNAME:</label>
              <input
                type="text"
                name="username"
                value={input.username}
                onChange={handleChange}
                className="terminal-input"
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div className="input-group">
              <label>PASSWORD:</label>
              <input
                type="password"
                name="password"
                value={input.password}
                onChange={handleChange}
                className="terminal-input"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="terminal-button"
              disabled={loading}
            >
              {loading ? "PROCESSING..." : "ACCESS SYSTEM"}
            </button>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="terminal-button secondary"
              disabled={loading}
            >
              NEW ADMIN REGISTRATION
            </button>
          </form>
          {status && (
            <p className={`status-message ${loading ? "blink" : ""}`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;