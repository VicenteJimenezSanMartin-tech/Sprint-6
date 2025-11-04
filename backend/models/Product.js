const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
 
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String }, 
  image: { type: String } 
});


module.exports = mongoose.model('Product', ProductSchema);