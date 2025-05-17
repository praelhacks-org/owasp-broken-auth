// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  // Grab the header
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res
      .status(403)
      .send('A token is required for authentication');
  }

  // Header should be "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res
      .status(401)
      .send('Malformed token');
  }

  const token = parts[1];
  console.log('Verifying JWT:', token);   // <-- will log the raw token

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res
        .status(401)
        .send('Invalid Token');
    }
    // Attach payload to req.user
    req.user = decoded;
    next();
  });
};