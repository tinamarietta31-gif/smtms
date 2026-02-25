const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const config = require('../config');

const SUPER_ADMIN_EMAILS = [
  'jerimothimmanuel@gmail.com',
  'tinamarietta31@gmail.com',
];

const googleClient = new OAuth2Client();

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

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google token.' });
    }

    // Determine role
    const role = SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) ? 'super_admin' : 'officer';

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update existing user's avatar and name if changed
      await user.update({ name: name || user.name, avatarUrl: picture || user.avatarUrl });
      // If the user is a super admin email but role was different, fix it
      if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) && user.role !== 'super_admin') {
        await user.update({ role: 'super_admin' });
      }
    } else {
      // Create new user — generate a random placeholder password hash
      const randomPass = await bcrypt.hash(Math.random().toString(36), 12);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPass,
        role,
        avatarUrl: picture,
        isActive: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Google login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google authentication failed.' });
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
