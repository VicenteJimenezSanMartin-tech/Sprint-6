const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  qty: { type: Number, min: 1, default: 1 }
}, { _id: false }); 


const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  pass: { type: String, required: true }, 
  

  cart: [CartItemSchema] 
});


module.exports = mongoose.model('User', UserSchema);