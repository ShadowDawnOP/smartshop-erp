const express = require('express');
const router  = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getTodaySummary,
  downloadInvoicePDF
} = require('../controllers/invoice.controller');
const { protect }        = require('../middleware/auth');
const { validateInvoice } = require('../middleware/validate');

router.get('/summary/today', protect, getTodaySummary);
router.get('/',              protect, getInvoices);
router.get('/:id/pdf',       protect, downloadInvoicePDF);
router.get('/:id',           protect, getInvoiceById);
router.post('/',             protect, validateInvoice, createInvoice);

module.exports = router;