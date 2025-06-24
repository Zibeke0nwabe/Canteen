const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.get('/forgot', authController.renderForgot);
router.post('/forgot', authController.forgot);
router.get('/logout', authController.logout);

router.get('/checkout', authController.checkout);

module.exports = router;
