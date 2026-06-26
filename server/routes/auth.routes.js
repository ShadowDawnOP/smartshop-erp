const express = require('express');
const router  = express.Router();
const { register, login, getMe, getUsers } = require('../controllers/auth.controller');
const { protect, ownerOnly } = require('../middleware/auth');
const { validateLogin }      = require('../middleware/validate');

router.post('/register', protect, ownerOnly, register);
router.post('/login',    validateLogin, login);
router.get('/me',        protect, getMe);
router.get('/users',     protect, ownerOnly, getUsers);

module.exports = router;