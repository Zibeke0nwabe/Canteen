const Item = require('../models/Item');
const Order = require('../models/Order');

exports.addToCart = (req, res) => {
  if (!req.session.cart.includes(req.body.itemId)) {
    req.session.cart.push(req.body.itemId);
  }
  res.redirect(req.headers.referer || '/');
};

exports.buyNow = (req, res) => {
  req.session.buyNow = [req.body.itemId];
  res.redirect('/cart?mode=buy-now');
};

exports.viewCart = async (req, res) => {
  const itemIds = req.query.mode === 'buy-now' ? req.session.buyNow : req.session.cart;
  const cartItems = itemIds?.length ? await Item.find({ _id: { $in: itemIds } }) : [];
  res.render('cart', { cartItems, cartCount: req.session.cart.length, user: req.session.userId });
};

exports.placeOrder = async (req, res) => {
  const refCode = "TTR" + Math.floor(100000 + Math.random() * 900000);
  await new Order({
    userId: req.session.userId,
    items: req.body.items || [],
    refCode
  }).save();
  res.send("Order placed. Ref: " + refCode);
};

exports.clearCart = (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
};

exports.tracker = async (req, res) => {
  const orders = await Order.find({ userId: req.session.userId });
  res.render('tracker', { orders });
};

exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId !== req.session.userId) return res.send("Invalid");

  if (['ordered', 'preparing', 'ready'].includes(order.status)) {
    order.cancelStatus = true;
    await order.save();
    res.send("Order cancelled with possible charge.");
  } else {
    res.send("Too late to cancel.");
  }
};
