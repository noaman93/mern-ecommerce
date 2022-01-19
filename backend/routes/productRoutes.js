const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productDetails,
} = require("../controllers/productsControllers");

const router = express.Router();

router.route("/products").get(getAllProducts);

router.route("/products/new").post(createProduct);

router
  .route("/products/:id")
  .put(updateProduct)
  .delete(deleteProduct)
  .get(productDetails);

module.exports = router;
