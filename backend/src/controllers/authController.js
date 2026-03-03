const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('../config/firebase');
const { User } = require('../models');
const config = require('../config');

const SUPER_ADMIN_EMAILS = [
  'jerimothimmanuel@gmail.com',
  'tinamarietta31@gmail.com',
];

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '24h' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required.' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, phone_number, name, picture, uid } = decodedToken;

    let identifierQuery = {};
    if (email) {
      identifierQuery = { email };
    } else if (phone_number) {
      identifierQuery = { phone: phone_number };
    } else {
      return res.status(400).json({ error: 'Token missing email or phone number.' });
    }

    // Determine role
    const role = (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) ? 'super_admin' : 'officer';

    // Find user
    let user = await User.findOne({ where: identifierQuery });

    if (user) {
      // Update existing user's avatar, name, phone if available
      await user.update({
        name: name || user.name,
        avatarUrl: picture || user.avatarUrl,
        phone: phone_number || user.phone
      });
      // If the user is a super admin email but role was different, fix it
      if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== 'super_admin') {
        await user.update({ role: 'super_admin' });
      }
    } else {
      // Only auto-create if it's a defined super admin email.
      // All other users (officers, etc) must be manually created by an admin first.
      if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
        const randomPass = Math.random().toString(36).slice(-10);
        user = await User.create({
          name: name || email.split('@')[0],
          email: email,
          password: randomPass,
          role: 'super_admin',
          phone: phone_number,
          avatarUrl: picture,
          isActive: true,
        });
      } else {
        return res.status(403).json({ error: 'Access denied. Your email is not authorized to access this system. Please contact an administrator.' });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Firebase login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Firebase login error details:', error);
    res.status(500).json({
      error: 'Firebase authentication failed.',
      details: error.message
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: role || 'officer', phone });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    res.json({ message: 'Profile updated', user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};
