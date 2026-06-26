const AppError = require('../utils/AppError');

const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;

  if (!name || name.trim() === '') {
    return next(new AppError('Product name is required', 400));
  }

  if (price === undefined || price === null) {
    return next(new AppError('Price is required', 400));
  }

  if (isNaN(price) || Number(price) < 0) {
    return next(new AppError('Price must be a positive number', 400));
  }

  if (stock === undefined || stock === null) {
    return next(new AppError('Stock is required', 400));
  }

  if (isNaN(stock) || Number(stock) < 0) {
    return next(new AppError('Stock must be a positive number', 400));
  }

  if (!category || category.trim() === '') {
    return next(new AppError('Category is required', 400));
  }

  next();
};

const validateCustomer = (req, res, next) => {
  const { name, phone } = req.body;

  if (!name || name.trim() === '') {
    return next(new AppError('Customer name is required', 400));
  }

  if (!phone || phone.trim() === '') {
    return next(new AppError('Phone number is required', 400));
  }

  if (!/^[0-9]{10}$/.test(phone.trim())) {
    return next(new AppError('Phone must be a 10-digit number', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    return next(new AppError('Email is required', 400));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new AppError('Please provide a valid email', 400));
  }

  if (!password) {
    return next(new AppError('Password is required', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  next();
};

const validateInvoice = (req, res, next) => {
  const { customerId, items } = req.body;

  if (!customerId) {
    return next(new AppError('Customer is required', 400));
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('At least one item is required', 400));
  }

  for (const item of items) {
    if (!item.productId) {
      return next(new AppError('Each item must have a product', 400));
    }
    if (!item.quantity || item.quantity < 1) {
      return next(new AppError('Each item must have a valid quantity', 400));
    }
  }

  next();
};

module.exports = {
  validateProduct,
  validateCustomer,
  validateLogin,
  validateInvoice
};