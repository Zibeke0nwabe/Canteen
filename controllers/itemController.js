const Item = require('../models/Item');

const ITEMS_PER_PAGE = 8;

// Landing Page - Guest
exports.landingPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const cartCount = req.session.cart?.length || 0;

  const totalItems = await Item.countDocuments();
  const items = await Item.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category: null,
    currentPage: page,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE)
  });
};

// Menu - All Items
exports.menuAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const cartCount = req.session.cart?.length || 0;

  const totalItems = await Item.countDocuments();
  const items = await Item.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category: 'All',
    currentPage: page,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE)
  });
};

// Menu - By Category
exports.menuByCategory = async (req, res) => {
  const category = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const cartCount = req.session.cart?.length || 0;

  const totalItems = await Item.countDocuments({ category });
  const items = await Item.find({ category })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render('landing', {
    items,
    user: req.session.userId,
    cartCount,
    category,
    currentPage: page,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE)
  });
};

// Home - Logged-in User
exports.home = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const cartCount = req.session.cart?.length || 0;

  const totalItems = await Item.countDocuments();
  const items = await Item.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render('home', {
    items,
    user: req.session.userId,
    cartCount,
    category: null,
    currentPage: page,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE)
  });
};

// Home - Logged-in User by Category
exports.homeByCategory = async (req, res) => {
  const category = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const cartCount = req.session.cart?.length || 0;

  const totalItems = await Item.countDocuments({ category });
  const items = await Item.find({ category })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render('home', {
    items,
    user: req.session.userId,
    cartCount,
    category,
    currentPage: page,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE)
  });
};

