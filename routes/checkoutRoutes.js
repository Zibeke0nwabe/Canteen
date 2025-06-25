const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/checkout', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const user = await User.findById(req.session.userId);
  const cartItems = req.session.cart || [];
  const totalAmount = cartItems.reduce((total, item) => {
    const qty = item.quantity || 1;
    return total + item.price * qty;
  }, 0);

  console.log('totalAmount in /checkout route:', totalAmount);
  console.log('user voucher:', user?.voucher);

  res.render('checkout', {
    user,
    totalAmount,
  });
});


router.get('/cart', async (req, res) => {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  const cartItems = req.session.cart || [];

  res.render('cart', {
    user,
    cartItems
  });
});

module.exports = router;
