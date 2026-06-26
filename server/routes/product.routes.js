const express = require('express');
const router  = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} = require('../controllers/product.controller');
const { protect, ownerOnly }  = require('../middleware/auth');
const { validateProduct }     = require('../middleware/validate');

router.get('/low-stock', protect, getLowStockProducts);
router.get('/',          protect, getProducts);
router.get('/:id',       protect, getProductById);
router.post('/',         protect, validateProduct, createProduct);
router.put('/:id',       protect, validateProduct, updateProduct);
router.delete('/:id',    protect, ownerOnly, deleteProduct);

module.exports = router;