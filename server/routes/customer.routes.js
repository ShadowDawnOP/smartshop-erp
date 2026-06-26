const express = require('express');
const router  = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} = require('../controllers/customer.controller');
const { protect, ownerOnly } = require('../middleware/auth');
const { validateCustomer }   = require('../middleware/validate');

router.get('/search',  protect, searchCustomers);
router.get('/',        protect, getCustomers);
router.get('/:id',     protect, getCustomerById);
router.post('/',       protect, validateCustomer, createCustomer);
router.put('/:id',     protect, validateCustomer, updateCustomer);
router.delete('/:id',  protect, ownerOnly, deleteCustomer);

module.exports = router;