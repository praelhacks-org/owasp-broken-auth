// src/controllers/employeeController.js
const fs   = require('fs/promises');
const path = require('path');

// adjust this if your data folder lives somewhere else
const DATA_FILE = path.join(__dirname, '../data/users.json');

/**
 * Helper to load all users from disk
 */
async function loadUsers() {
  const json = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(json);
}

/**
 * Helper to save all users back to disk
 */
async function saveUsers(users) {
  const json = JSON.stringify(users, null, 2);
  await fs.writeFile(DATA_FILE, json, 'utf-8');
}

/**
 * GET /api/employees/:id
 */
exports.getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users  = await loadUsers();

    const user = users.find(u => String(u.id) === String(id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/employees/:id
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const { id }       = req.params;
    const updates      = req.body;
    const users        = await loadUsers();
    const index        = users.findIndex(u => String(u.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // merge updates into the existing user object
    users[index] = {
      ...users[index],
      ...updates,
      id: users[index].id,             // ensure id never gets overwritten
    };

    await saveUsers(users);

    res.json(users[index]);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/employees?search=<term>
 */
exports.searchEmployees = async (req, res, next) => {
  try {
    const term  = (req.query.search || '').toLowerCase();
    const users = await loadUsers();

    const matches = users.filter(u =>
      u.username.toLowerCase().includes(term)
    );
    res.json(matches);
  } catch (err) {
    next(err);
  }
};