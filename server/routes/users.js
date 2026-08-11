import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/me/services', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user?.connectedServices || []);
});

router.post('/me/services', authMiddleware, async (req, res) => {
  const { service } = req.body;
  if (!service || !service.id) return res.status(400).json({ message: 'Invalid service' });
  const user = await User.findById(req.userId);
  user.connectedServices.push(service);
  await user.save();
  res.json(user.connectedServices);
});

router.put('/me/preferences', authMiddleware, async (req, res) => {
  const { preferences } = req.body;
  const user = await User.findById(req.userId);
  user.preferences = { ...Object.fromEntries(user.preferences || []), ...preferences };
  await user.save();
  res.json(user.preferences);
});

export default router;
