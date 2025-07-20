const Item = require('../models/Item');
const Order = require('../models/Order');

exports.addToCart = (req, res) => {
  if (!req.session.cart) req.session.cart = [];

  const existingItem = req.session.cart.find(item => item.itemId === req.body.itemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    req.session.cart.push({ itemId: req.body.itemId, quantity: 1 });
  }

  res.redirect(req.headers.referer || '/');
};
exports.buyNow = (req, res) => {
  req.session.buyNow = [{ itemId: req.body.itemId, quantity: 1 }];
  res.redirect('/cart?mode=buy-now');
};

exports.viewCart = async (req, res) => {
  const cartSession = req.query.mode === 'buy-now' ? req.session.buyNow : req.session.cart;
  const itemIds = cartSession?.map(c => c.itemId) || [];
  const items = itemIds.length ? await Item.find({ _id: { $in: itemIds } }) : [];

  const cartItems = items.map(item => {
    const cartEntry = cartSession.find(c => c.itemId === item._id.toString());
    return {
      ...item.toObject(),
      quantity: cartEntry?.quantity || 1
    };
  });

  res.render('cart', {
    cartItems,
    cartCount: cartSession?.length || 0,
    user: req.session.userId
  });
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
