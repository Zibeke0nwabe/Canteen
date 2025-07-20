const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User'); 

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');


const app = express();
console.log('Starting express server…');
app.get('/test', (req, res) => res.send('Test route works'));
// Connect to MongoDB
connectDB();

// View Engine & Static Files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// Routes
app.use(authRoutes);
app.use(adminRoutes);
app.use('/', itemRoutes);
app.use(orderRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
