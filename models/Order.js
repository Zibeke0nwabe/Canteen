const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  status: { type: String, default: 'ordered' },
  refCode: String,
  cancelStatus: { type: Boolean, default: false },
});

module.exports = mongoose.model('Order', orderSchema);
