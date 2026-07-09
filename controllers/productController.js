const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      brand,
      price,
      discountPercentage,
      stockQuantity,
      description,
      status,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const numericPrice = Number(price);
    const numericDiscount = Number(discountPercentage || 0);

    const product = await Product.create({
      productName,
      category,
      brand,
      price: numericPrice,
      discountPercentage: numericDiscount,
      finalPrice: numericPrice - (numericPrice * numericDiscount) / 100,
      stockQuantity: Number(stockQuantity),
      description,
      status,
      productImage: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Products with Search, Filters, Sorting and Pagination
const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "All",
      status = "All",
      sortBy = "date",
      page = 1,
      limit = 5,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.productName = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category !== "All") {
      query.category = category;
    }

    if (status !== "All") {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };

    if (sortBy === "price") {
      sortOption = { finalPrice: 1 };
    }

    if (sortBy === "name") {
      sortOption = { productName: 1 };
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 5, 1);

    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
      currentPage: pageNumber,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Product By ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      productName,
      category,
      brand,
      price,
      discountPercentage,
      stockQuantity,
      description,
      status,
    } = req.body;

    const updatedPrice = Number(price);
    const updatedDiscount = Number(discountPercentage || 0);

    const updatedData = {
      productName,
      category,
      brand,
      price: updatedPrice,
      discountPercentage: updatedDiscount,
      stockQuantity: Number(stockQuantity),
      description,
      status,
      finalPrice: updatedPrice - (updatedPrice * updatedDiscount) / 100,
    };

    if (req.file) {
      // Remove the old local image when a replacement is uploaded.
      if (
        product.productImage &&
        product.productImage.startsWith("/uploads/")
      ) {
        const oldImagePath = path.join(__dirname, "..", product.productImage);

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updatedData.productImage = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.productImage && product.productImage.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", product.productImage);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
