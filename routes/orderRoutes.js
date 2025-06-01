const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

router.post('/add-to-cart', orderController.addToCart);
router.post('/buy-now', orderController.buyNow);
router.get('/cart', orderController.viewCart);
router.post('/buy', isLoggedIn, orderController.placeOrder);
router.post('/clear-cart', orderController.clearCart);
router.get('/tracker', isLoggedIn, orderController.tracker);
router.post('/cancel/:id', isLoggedIn, orderController.cancelOrder);

module.exports = router;
