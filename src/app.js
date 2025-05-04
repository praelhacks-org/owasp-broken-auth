const express = require('express');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth'); // Import your auth routes

const app = express();

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
}));

// Middleware to parse JSON
app.use(express.json());

// Use the auth routes for API requests
app.use('/api/', authRoutes); // Adjusted to use the auth routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
