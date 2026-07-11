const express = require("express");
const upload = require("../utils/multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Protect ALL routes
router.get("/", authMiddleware, getProducts);

router.get("/:id", authMiddleware, getProductById);

router.post("/", authMiddleware, upload.single("productImage"), createProduct);

router.put(
  "/:id",
  authMiddleware,
  upload.single("productImage"),
  updateProduct,
);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
