import db from '../models/db.js';
import bcrypt from 'bcrypt';

export const getUsers = (req, res) => {
  const sql = "SELECT id, name, email, role, created_at FROM users WHERE role = 'user'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Get users error', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

export const getProfile = (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
};

export const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
  db.query(checkEmailSql, [email, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const updateSql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.query(updateSql, [name, email, userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Profile updated successfully' });
    });
  });
};

export const resetPassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const getSql = 'SELECT password FROM users WHERE id = ?';
  db.query(getSql, [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, results[0].password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashed, userId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Password reset successful' });
    });
  });
};