const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// EJS Setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  secret: 'canteen-secret',
  resave: false,
  saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Schemas & Models
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  code: String
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String
});

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  status: { type: String, default: 'ordered' },
  refCode: String,
  cancelStatus: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Item = mongoose.model('Item', itemSchema);
const Order = mongoose.model('Order', orderSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
function isLoggedIn(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session.adminId) return next();
  res.redirect('/admin/login');
}

// Initialize cart session
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// Routes
app.get('/', async (req, res) => {
  const items = await Item.find();
  const cartCount = req.session.cart.length;
  res.render('landing', { items, user: req.session.userId, cartCount, category: null });
});

app.get('/menu/:category', async (req, res) => {
  const items = await Item.find({ category: req.params.category });
  res.render('landing', { items, user: req.session.userId, cartCount: req.session.cart.length, category: req.params.category });
});

app.get('/home', isLoggedIn, async (req, res) => {
  const items = await Item.find();
  res.render('home', { items, user: req.session.userId, cartCount: req.session.cart.length });
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.send('Account already exists.');

  const hashed = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await transporter.sendMail({
    to: email,
    subject: 'CANTEEN - Verification Code',
    text: `Your code: ${code}`
  });

  await new User({ email, password: hashed, code }).save();
  res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.send('Invalid credentials');
  }
  req.session.userId = user._id;
  res.redirect('/home');
});

app.get('/forgot', (req, res) => res.render('forgot'));
app.post('/forgot', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send('Code sent if user exists.');

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.code = code;
  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: 'Reset Code - CANTEEN',
    text: `Reset code: ${code}`
  });

  res.send('Code sent to your email.');
});

// Admin
app.get('/admin/login', (req, res) => res.render('admin-login'));
app.post('/admin/login', async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) {
    return res.send('Invalid credentials');
  }
  req.session.adminId = admin._id;
  res.redirect('/admin');
});

app.get('/admin/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login')));

app.get('/admin', isAdmin, async (req, res) => {
  const orders = await Order.find();
  const items = await Item.find();
  res.render('admin', { orders, items });
});

app.post('/admin/add-item', isAdmin, upload.single('imageFile'), async (req, res) => {
  const { name, description, price, category, imageURL } = req.body;
  let imagePath = '';

  if (req.file) {
    // If file was uploaded, use local path
    imagePath = '/uploads/' + req.file.filename;
  } else if (imageURL && imageURL.trim() !== '') {
    imagePath = imageURL.trim();
  }

  await new Item({
    name,
    description,
    price,
    category,
    image: imagePath
  }).save();

  res.redirect('/admin');
});


app.post('/admin/update-status/:id', isAdmin, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect('/admin');
});

app.post('/admin/delete-item', isAdmin, async (req, res) => {
  await Item.findByIdAndDelete(req.body.itemId);
  res.redirect('/admin');
});

app.get('/admin/register', (req, res) => res.render('register-admin'));
app.post('/admin/register', async (req, res) => {
  const exists = await Admin.findOne({ email: req.body.email });
  if (exists) return res.send('Admin already exists');

  const hashed = await bcrypt.hash(req.body.password, 10);
  await new Admin({ email: req.body.email, password: hashed }).save();
  res.send('Admin registered');
});

// Cart and Order
app.post('/add-to-cart', (req, res) => {
  if (!req.session.cart.includes(req.body.itemId)) {
    req.session.cart.push(req.body.itemId);
  }
  res.redirect(req.headers.referer || '/');
});

app.post('/buy-now', (req, res) => {
  req.session.buyNow = [req.body.itemId];
  res.redirect('/cart?mode=buy-now');
});

app.get('/cart', async (req, res) => {
  const itemIds = req.query.mode === 'buy-now' ? req.session.buyNow : req.session.cart;
  const cartItems = itemIds?.length ? await Item.find({ _id: { $in: itemIds } }) : [];
  res.render('cart', { cartItems, cartCount: req.session.cart.length, user: req.session.userId });
});

app.post('/buy', isLoggedIn, async (req, res) => {
  const refCode = "TTR" + Math.floor(100000 + Math.random() * 900000);
  await new Order({
    userId: req.session.userId,
    items: req.body.items || [],
    refCode
  }).save();
  res.send("Order placed. Ref: " + refCode);
});

app.post('/clear-cart', (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
});

app.get('/tracker', isLoggedIn, async (req, res) => {
  const orders = await Order.find({ userId: req.session.userId });
  res.render('tracker', { orders });
});

app.post('/cancel/:id', isLoggedIn, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId !== req.session.userId) return res.send("Invalid");

  if (['ordered', 'preparing', 'ready'].includes(order.status)) {
    order.cancelStatus = true;
    await order.save();
    res.send("Order cancelled with possible charge.");
  } else {
    res.send("Too late to cancel.");
  }
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));