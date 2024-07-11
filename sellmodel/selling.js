const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imagePath: {
    type: String
  }
}, { timestamps: true });

const Selling = mongoose.model('Selling', sellingSchema);
module.exports = Selling;