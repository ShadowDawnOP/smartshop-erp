const Invoice  = require('../models/invoice.model');
const Product  = require('../models/product.model');
const Customer = require('../models/customer.model');

const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      todayInvoices,
      monthInvoices,
      lowStockProducts,
      creditCustomers,
      totalProducts,
      totalCustomers
    ] = await Promise.all([
      Invoice.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Invoice.find({ createdAt: { $gte: monthStart } }),
      Product.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] }
      }),
      Customer.find({ outstandingCredit: { $gt: 0 }, isActive: true }),
      Product.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: true })
    ]);

    const todaySales   = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCredit  = creditCustomers.reduce((sum, c) => sum + c.outstandingCredit, 0);

    res.json({
      success: true,
      data: {
        todaySales,
        todayBills:     todayInvoices.length,
        monthRevenue,
        monthBills:     monthInvoices.length,
        totalCredit,
        creditCustomers: creditCustomers.length,
        lowStockCount:  lowStockProducts.length,
        lowStockItems:  lowStockProducts.slice(0, 5),
        totalProducts,
        totalCustomers
      }
    });

  } catch (error) {
    next(error);
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const days = [];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setHours(23, 59, 59, 999);

      const invoices = await Invoice.find({
        createdAt: { $gte: date, $lte: nextDate }
      });

      const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
      days.push(total);

      labels.push(date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric'
      }));
    }

    res.json({ success: true, data: { labels, values: days } });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id:          '$items.name',
          totalSold:    { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, data: topProducts });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getDashboardStats, getRevenueChart, getTopProducts };