// src/controllers/authController.js
const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET in environment');
}

// helper to load and parse users.json
function loadUsers() {
  const p = path.join(__dirname, '../data/users.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return res
      .status(404)
      .json({ message: 'Username does not exist.' });
  }

  // plain-text comparison for demo only
  if (password !== user.password) {
    return res
      .status(401)
      .json({ message: 'Invalid password.' });
  }

  const payload = {
    sub:  user.id,      
    role: user.role,     
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

  return res.status(200).json({
    message:     'Login successful.',
    token,
  });
};