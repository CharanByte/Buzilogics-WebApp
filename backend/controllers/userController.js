import db from '../models/db.js';


export const getUsers = (req, res) => {
  const sql =  "SELECT id, name, email, role, created_at  FROM users WHERE role = 'user'";

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