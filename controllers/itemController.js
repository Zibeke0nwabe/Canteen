const Item = require('../models/Item');

// PUBLIC LANDING
exports.landingPage = async (req, res) => {
  const items = await Item.find();
  const cartCount = req.session.cart?.length || 0;
  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category: null
  });
};

exports.menuAll = async (req, res) => {
  const items = await Item.find();
  const cartCount = req.session.cart?.length || 0;
  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category: 'All'
  });
};

exports.menuByCategory = async (req, res) => {
  const category = req.params.category;
  const items = await Item.find({ category });
  const cartCount = req.session.cart?.length || 0;
  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category
  });
};

// LOGGED-IN HOME
exports.home = async (req, res) => {
  const items = await Item.find();
  const cartCount = req.session.cart?.length || 0;
  res.render('home', {
    items,
    user: req.session.userId,
    cartCount,
    category: null
  });
};

exports.homeByCategory = async (req, res) => {
  const category = req.params.category;
  const items = await Item.find({ category });
  const cartCount = req.session.cart?.length || 0;
  res.render('home', {
    items,
    user: req.session.userId,
    cartCount,
    category
  });
};

