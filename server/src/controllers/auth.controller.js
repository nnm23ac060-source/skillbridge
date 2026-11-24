const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

const shapeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  education: user.education,
  skills: user.skills,
  linkedin: user.linkedin,
  github: user.github,
  portfolio: user.portfolio,
  resume: user.resume,
  createdAt: user.createdAt,
  profileCompleteness: user.profileCompleteness ? user.profileCompleteness() : 0,
});

/**
 * POST /api/auth/register
 * Public — creates a student account (role is always 'student';
 * admin accounts are created via the seed script).
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.exists({ email });
  if (exists) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
      errors: [{ field: 'email', msg: 'An account with this email already exists' }],
    });
  }

  // Role is intentionally NOT read from the body — public signup = student.
  const user = await User.create({ name, email, password, role: 'student' });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user: shapeUser(user), token },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same generic message for wrong email or password (no user enumeration)
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: [{ field: 'password', msg: 'Invalid email or password' }],
    });
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    message: `Welcome back, ${user.name.split(' ')[0]}!`,
    data: { user: shapeUser(user), token },
  });
});

/**
 * GET /api/auth/me  (protected)
 */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: shapeUser(req.user) } });
});

module.exports = { register, login, me };
