require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const authRoutes     = require('./routes/auth');
const employeeRoutes = require('./routes/employees');

const app = express();

// CORS — allow your Next.js front-end
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use('/api',           authRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
// <— bind to 0.0.0.0 so that Windows (and Burp) can see it
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on 0.0.0.0:${PORT}`);
});