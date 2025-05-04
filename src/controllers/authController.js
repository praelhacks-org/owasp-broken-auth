const bcrypt = require('bcryptjs'); // Changed to bcryptjs

// Hardcoded users array
const users = [
  { username: 'user1', password: bcrypt.hashSync('password1', 10) },
  { username: 'user2', password: bcrypt.hashSync('password2', 10) },
];

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Find user in the hardcoded array
  const user = users.find(u => u.username === username);

  // Check if user exists and password matches
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // If valid, respond with success (you can also generate a token here)
  res.status(200).json({ message: 'Login successful' });
};
