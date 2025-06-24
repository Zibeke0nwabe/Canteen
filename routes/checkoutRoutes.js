const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Show Checkout Page
router.get('/checkout', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const user = await User.findById(req.session.userId);
  const cartItems = req.session.cart || [];
  const cartTotal = cartItems.reduce((total, item) => {
    const qty = item.quantity || 1;
    return total + item.price * qty;
  }, 0);

  res.render('checkout', {
    user,
    cartTotal,
  });
});

module.exports = router;
