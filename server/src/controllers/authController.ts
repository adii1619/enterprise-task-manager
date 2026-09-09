import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'your-fallback-secret-key';

const serializeUser = (user: { _id: unknown; name: string; email: string; role: string; avatarUrl?: string }) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
});

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!name || !normalizedEmail || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error registering user', error });
  }
};

// Authenticate a user and return a token
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
};

// Return the current user's profile
export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  res.status(200).json({ user: req.user });
};
