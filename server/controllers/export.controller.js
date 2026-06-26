const { Parser } = require('json2csv');
const Product  = require('../models/product.model');
const Invoice  = require('../models/invoice.model');
const Customer = require('../models/customer.model');
const Payment  = require('../models/payment.model');

const exportProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name category price stock unit lowStockThreshold createdAt')
      .lean();

    const fields = [
      { label: 'Name',            value: 'name' },
      { label: 'Category',        value: 'category' },
      { label: 'Price (Rs)',       value: 'price' },
      { label: 'Stock',           value: 'stock' },
      { label: 'Unit',            value: 'unit' },
      { label: 'Low Stock Alert', value: 'lowStockThreshold' },
      { label: 'Added On',        value: row =>
          new Date(row.createdAt).toLocaleDateString('en-IN') }
    ];

    const parser = new Parser({ fields });
    const csv    = parser.parse(products);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.send(csv);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportInvoices = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const rows = invoices.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      customerName:  inv.customerName,
      items:         inv.items.map(i => `${i.name} x${i.quantity}`).join(' | '),
      subtotal:      inv.subtotal,
      discount:      inv.discount,
      total:         inv.total,
      paymentMethod: inv.paymentMethod,
      status:        inv.status,
      date:          new Date(inv.createdAt).toLocaleDateString('en-IN')
    }));

    const fields = [
      { label: 'Invoice #',       value: 'invoiceNumber' },
      { label: 'Customer',        value: 'customerName' },
      { label: 'Items',           value: 'items' },
      { label: 'Subtotal (Rs)',   value: 'subtotal' },
      { label: 'Discount (Rs)',   value: 'discount' },
      { label: 'Total (Rs)',      value: 'total' },
      { label: 'Payment Method',  value: 'paymentMethod' },
      { label: 'Status',          value: 'status' },
      { label: 'Date',            value: 'date' }
    ];

    const parser = new Parser({ fields });
    const csv    = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    res.send(csv);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportCreditReport = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .select('name phone address totalPurchases outstandingCredit createdAt')
      .lean();

    const fields = [
      { label: 'Name',               value: 'name' },
      { label: 'Phone',              value: 'phone' },
      { label: 'Address',            value: 'address' },
      { label: 'Total Purchases',    value: 'totalPurchases' },
      { label: 'Outstanding Credit', value: 'outstandingCredit' },
      { label: 'Customer Since',     value: row =>
          new Date(row.createdAt).toLocaleDateString('en-IN') }
    ];

    const parser = new Parser({ fields });
    const csv    = parser.parse(customers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="credit-report.csv"');
    res.send(csv);

  } catch (error) {
    next(error);
  }
};

module.exports = { exportProducts, exportInvoices, exportCreditReport };