const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users array
let users = [];

// Load existing users
try {
    const data = fs.readFileSync(USERS_FILE);
    users = JSON.parse(data);
} catch (error) {
    // If file doesn't exist, create with default admin user
    users = [{ username: 'admin', password: 'admin123' }];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Function to save users
const saveUsers = () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

module.exports = {
    users,
    saveUsers
};