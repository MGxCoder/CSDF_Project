import React, { useState, useEffect } from "react";

function RegisterPage({ switchToLogin }) {
  const [input, setInput] = useState({ username: "", password: "" });
  const [status, setStatus] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Fetch registered users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/users", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setRegisteredUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("Processing registration...");

    try {
      if (!input.username || !input.password) {
        setStatus("Username and password are required");
        return;
      }

      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        mode: "cors", // Add this line
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Registration successful! Redirecting to login...");
        await fetchUsers(); // Refresh user list
        setTimeout(switchToLogin, 2000);
      } else {
        setStatus(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setStatus("Error connecting to server - Please try again");
    }
  };

  return (
    <div className="hacker-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="terminal-title">SYSTEM REGISTRATION</span>
        </div>
        <div className="terminal-body">
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>USERNAME:</label>
              <input
                type="text"
                name="username"
                value={input.username}
                onChange={handleChange}
                className="terminal-input"
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
              />
            </div>
            <button type="submit" className="terminal-button">
              REGISTER
            </button>
            <button
              type="button"
              onClick={switchToLogin}
              className="terminal-button secondary"
            >
              BACK TO LOGIN
            </button>
          </form>
          {status && <p className="status-message">{status}</p>}

          {/* Add registered users list */}
          <div className="users-list">
            <h3>REGISTERED USERS:</h3>
            <div className="terminal-text">
              {registeredUsers.map((user, index) => (
                <p key={index}>{`>>> ${user.username}`}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;