const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  code: String,
  voucher: {
    amount: { type: Number, default: 500 },
    issued: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('User', userSchema);
