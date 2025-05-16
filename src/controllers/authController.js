const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET in environment');
}

const users = [
  {
    id:       1,
    username: 'user1',
    password: bcrypt.hashSync('password1', 10),
    role:     'user',
    department:  'HR',
  },
  {
    id:       2,
    username: 'user2',
    password: bcrypt.hashSync('password2', 10),
    role:     'user',
    department:  'Engineering',
  },
  // Example admin:
  // {
  //   id:       3,
  //   username: 'admin',
  //   password: bcrypt.hashSync('adminPass', 10),
  //   role:     'admin',
  // },
];

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res
      .status(404)
      .json({ message: 'Username does not exist.' });
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);
  if (!passwordMatches) {
    return res
      .status(401)
      .json({ message: 'Invalid password.' });
  }

  const payload = {
    id:       user.id,
    username: user.username,
    role:     user.role,
  };

  const token = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: '1h' }
  );

  // Send token and redirect URL on successful login
  return res.status(200).json({
    message: 'Login successful.',
    token,
    redirectUrl: '/employee-portal'
  });
};