const Payment = require('../models/payment.model');
const Customer = require('../models/customer.model');

const recordPayment = async (req, res) => {
  try {
    const { customerId, amount, method, note } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Customer and amount are required'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    if (customer.outstandingCredit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'This customer has no outstanding credit'
      });
    }

    if (amount > customer.outstandingCredit) {
      return res.status(400).json({
        success: false,
        error: `Amount exceeds outstanding credit of ₹${customer.outstandingCredit}`
      });
    }

    const payment = await Payment.create({
      customer: customerId,
      customerName: customer.name,
      amount,
      method,
      note,
      recordedBy: req.user._id,
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { outstandingCredit: -amount }
    });

    const updatedCustomer = await Customer.findById(customerId);

    res.status(201).json({
      success: true,
      data: {
        payment,
        remainingCredit: updatedCustomer.outstandingCredit
      }
    });

  } catch (error) {
    next(error);
  }
};

const getPaymentsByCustomer = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.params.customerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCreditCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      outstandingCredit: { $gt: 0 },
      isActive: true
    }).sort({ outstandingCredit: -1 });

    const totalOutstanding = customers.reduce(
      (sum, c) => sum + c.outstandingCredit, 0
    );

    res.json({
      success: true,
      count: customers.length,
      totalOutstanding,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  recordPayment,
  getPaymentsByCustomer,
  getAllPayments,
  getCreditCustomers
};