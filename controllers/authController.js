const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register a new user
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        return res.status(500).json({ success: false, message: 'Error hashing password.' });
      }

      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name.trim(), trimmedEmail, hashedPassword],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({ success: false, message: 'Error creating user: ' + insertErr.message });
          }

          const userId = this.lastID;
          const token = jwt.sign({ id: userId, name: name.trim(), email: trimmedEmail }, JWT_SECRET, {
            expiresIn: '7d'
          });

          return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            token,
            user: { id: userId, name: name.trim(), email: trimmedEmail }
          });
        }
      );
    });
  });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [trimmedEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    bcrypt.compare(password, user.password, (cmpErr, isMatch) => {
      if (cmpErr) {
        return res.status(500).json({ success: false, message: 'Error verifying password.' });
      }
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, {
        expiresIn: '7d'
      });

      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    });
  });
};

// Get current user profile
exports.getMe = (req, res) => {
  db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user });
  });
};
