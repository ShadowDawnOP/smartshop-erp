const express = require('express');
const router  = express.Router();
const {
  getDashboardStats,
  getRevenueChart,
  getTopProducts
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.get('/stats',       protect, getDashboardStats);
router.get('/chart',       protect, getRevenueChart);
router.get('/top-products', protect, getTopProducts);

module.exports = router;