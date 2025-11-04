const mongoose = require('mongoose');


const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String },
  price: { type: Number },
  qty: { type: Number }
}, { _id: false }); 

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: { type: String, required: true }, 
  total: { type: Number, required: true },
  status: { type: String, default: 'en_preparacion' },
  items: [OrderItemSchema], 
  created_at: { type: Date, default: Date.now } 
});


module.exports = mongoose.model('Order', OrderSchema);