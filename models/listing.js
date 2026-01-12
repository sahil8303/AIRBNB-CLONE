const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?auto=format&fit=crop&w=800&q=60"
    },
    filename: {
      type: String,
      default: "listing"
    }
  },
  price: Number,
  location: String,
  country: String
});

module.exports = mongoose.model("Listing", listingSchema);
