const express = require('express');
const router  = express.Router();
const {
  exportProducts,
  exportInvoices,
  exportCreditReport
} = require('../controllers/export.controller');
const { protect } = require('../middleware/auth');

router.get('/products',      protect, exportProducts);
router.get('/invoices',      protect, exportInvoices);
router.get('/credit-report', protect, exportCreditReport);

module.exports = router;