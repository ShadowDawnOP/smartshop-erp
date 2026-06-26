const Invoice = require('../models/invoice.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');
const generateInvoicePDF = require('../utils/generatePDF');

const createInvoice = async (req, res) => {
  try {
    const { customerId, items, discount = 0, paymentMethod } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer and at least one item are required'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const invoiceItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      invoiceItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    const total = Math.max(0, subtotal - discount);

    const invoice = await Invoice.create({
      customer: customerId,
      customerName: customer.name,
      items: invoiceItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      status: paymentMethod === 'credit' ? 'credit' : 'paid',
      createdBy: req.user._id,
    });
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }
    const creditIncrease = paymentMethod === 'credit' ? total : 0;
    await Customer.findByIdAndUpdate(customerId, {
      $inc: {
        totalPurchases: total,
        outstandingCredit: creditIncrease,
      }
    });

    res.status(201).json({ success: true, data: invoice });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const {
      status,
      date,
      from,
      to,
      customer,
      page  = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status && ['paid', 'credit'].includes(status)) {
      filter.status = status;
    }

    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    } else if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    if (customer) {
      filter.customerName = { $regex: customer, $options: 'i' };
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      success: true,
      count:   invoices.length,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
      totalAmount,
      data:    invoices
    });
    
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTodaySummary = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const invoices = await Invoice.find({
      createdAt: { $gte: start, $lte: end }
    });

    const totalSales   = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalBills   = invoices.length;
    const cashSales    = invoices.filter(i => i.paymentMethod === 'cash').reduce((sum, i) => sum + i.total, 0);
    const creditSales  = invoices.filter(i => i.paymentMethod === 'credit').reduce((sum, i) => sum + i.total, 0);

    res.json({
      success: true,
      data: { totalSales, totalBills, cashSales, creditSales }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    generateInvoicePDF(invoice, res);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getTodaySummary,
  downloadInvoicePDF
};