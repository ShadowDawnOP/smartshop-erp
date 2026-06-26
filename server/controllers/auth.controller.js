const jwt          = require('jsonwebtoken');
const User         = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 400);

  const user  = await User.create({ name, email, password, role });
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true });
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, data: user });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select('-password');
  res.json({ success: true, count: users.length, data: users });
});

module.exports = { register, login, getMe, getUsers };