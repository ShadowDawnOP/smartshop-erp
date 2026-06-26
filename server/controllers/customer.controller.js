const Customer     = require('../models/customer.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, count: customers.length, data: customers });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, data: customer });
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, data: customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!customer) throw new AppError('Customer not found', 404);
  res.json({ success: true, message: 'Customer removed' });
});

const searchCustomers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new AppError('Search query required', 400);

  const customers = await Customer.find({
    isActive: true,
    $or: [
      { name:  { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ]
  });

  res.json({ success: true, count: customers.length, data: customers });
});

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
};