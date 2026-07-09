const express = require("express");
const upload = require("../utils/multer");
const protect = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, upload.single("productImage"), createProduct);

router.put("/:id", protect, upload.single("productImage"), updateProduct);

router.delete("/:id", protect, deleteProduct);

module.exports = router;
