// scripts/seedVouchers.js
require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');
const User = require('../models/User'); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    const result = await User.updateMany(
      { voucher: { $exists: false } }, 
      {
        $set: {
          'voucher.amount': 500,
          'voucher.issued': true
        }
      }
    );
    console.log(` Updated ${result.modifiedCount} users with voucher`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Failed to update users:', err);
  });
