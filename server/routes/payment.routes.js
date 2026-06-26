const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPaymentsByCustomer,
  getAllPayments,
  getCreditCustomers
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

router.get('/credit-customers',         protect, getCreditCustomers);
router.get('/customer/:customerId',     protect, getPaymentsByCustomer);
router.get('/',                         protect, getAllPayments);
router.post('/',                        protect, recordPayment);

module.exports = router;