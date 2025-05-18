// src/routes/employees.js
const express = require('express');
const router  = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getEmployee,
  updateEmployee,
  searchEmployees,
} = require('../controllers/employeeController');

router.use(verifyToken);

// GET /api/employees/:id
router.get('/:id', getEmployee);

// PUT /api/employees/:id
router.put('/:id', updateEmployee);

router.get('/', searchEmployees);

module.exports = router;