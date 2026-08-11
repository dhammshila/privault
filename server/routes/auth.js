import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 3600 * 1000
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash
    });

    // Auto-login after registration
    const token = jwt.sign({ sub: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTS);

    return res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      username: newUser.username
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTS);

    return res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;
