const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    finalPrice: {
      type: Number,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

// Calculate Final Price automatically
productSchema.pre("save", function () {
  this.finalPrice = this.price - (this.price * this.discountPercentage) / 100;
});

module.exports = mongoose.model("Product", productSchema);
