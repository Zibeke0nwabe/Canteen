const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.renderLogin = (req, res) => res.render('login',{ error: ''});

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const isValid = user && await bcrypt.compare(req.body.password, user.password);

  if (!isValid) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  req.session.userId = user._id;
  res.redirect('/home');
};


exports.renderForgot = (req, res) => res.render('forgot');

exports.forgot = async (req, res) => {
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
};

exports.checkout = async (req, res) => {
   console.log('🔑 Checkout route reached, session.userId =', req.session.userId);
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
};

exports.logout = (req, res) => req.session.destroy(() => res.redirect('/'));

