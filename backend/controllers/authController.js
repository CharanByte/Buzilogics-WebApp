import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const saltRounds = 10;


export const registerUser = (req, res) => {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });


const hashed = bcrypt.hashSync(password, saltRounds);
const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';


db.query(sql, [name, email, hashed], (err, result) => {
if (err) {
console.error('Register error', err);
if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'User already exists' });
return res.status(500).json({ error: 'Database error' });
}
res.json({ message: 'Registration successful' });
});
};


export const loginUser = (req, res) => {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ error: 'Missing fields' });


const sql = 'SELECT * FROM users WHERE email = ?';
db.query(sql, [email], (err, results) => {
if (err) {
console.error('Login error', err);
return res.status(500).json({ error: 'Database error' });
}
if (!results.length) return res.status(404).json({ error: 'User not found' });


const user = results[0];
const valid = bcrypt.compareSync(password, user.password);
if (!valid) return res.status(401).json({ error: 'Invalid credentials' });


const payload = { id: user.id, role: user.role, name: user.name };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN || '2h' });


res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
};