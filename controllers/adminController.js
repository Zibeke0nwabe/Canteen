const Admin = require('../models/Admin');
const Item = require('../models/Item');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage });

exports.renderLogin = (req, res) => res.render('admin-login');

exports.login = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) {
    return res.send('Invalid credentials');
  }
  req.session.adminId = admin._id;
  res.redirect('/admin');
};

exports.logout = (req, res) => req.session.destroy(() => res.redirect('/admin/login'));

exports.dashboard = async (req, res) => {
  const orders = await Order.find();
  const items = await Item.find();
  res.render('admin', { orders, items });
};

exports.addItem = async (req, res) => {
  const { name, description, price, category, imageURL } = req.body;
  let imagePath = '';

  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (imageURL && imageURL.trim() !== '') {
    imagePath = imageURL.trim();
  }

  await new Item({ name, description, price, category, image: imagePath }).save();
  res.redirect('/admin');
};

exports.updateStatus = async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect('/admin');
};

exports.deleteItem = async (req, res) => {
  await Item.findByIdAndDelete(req.body.itemId);
  res.redirect('/admin');
};
