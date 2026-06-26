const Product      = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, status,
    page = 1, limit = 20
  } = req.query;

  const filter = { isActive: true };

  if (search)   filter.name     = { $regex: search, $options: 'i' };
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (status === 'low')  filter.$expr  = { $lte: ['$stock', '$lowStockThreshold'] };
  if (status === 'out')  filter.stock  = 0;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: products.length,
    total,
    page:  parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data:  products
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});

const getLowStockProducts = asyncHandler(async (req, res) => {
  const allProducts = await Product.find({ isActive: true });
  const lowStock    = allProducts.filter(p => {
    const threshold = p.lowStockThreshold ?? 10;
    return p.stock <= threshold;
  });
  res.json({ success: true, count: lowStock.length, data: lowStock });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};