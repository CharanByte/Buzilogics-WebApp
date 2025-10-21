import jwt from 'jsonwebtoken';


export const authenticate = (req, res, next) => {
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ error: 'Missing token' });


const token = authHeader.split(' ')[1];
if (!token) return res.status(401).json({ error: 'Invalid token format' });


try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
next();
} catch (err) {
return res.status(401).json({ error: 'Token invalid or expired' });
}
};


export const authorizeAdmin = (req, res, next) => {
if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden - admin only' });
next();
};