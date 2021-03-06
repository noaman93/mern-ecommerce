const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productsControllers");
const { isAuthenticateUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);

router
  .route("/admin/products/new")
  .post(isAuthenticateUser, authorizeRoles("admin"), createProduct);

router
  .route("/admin/products/:id")
  .put(isAuthenticateUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteProduct);

router.route("/products/:id").get(productDetails);

//create or update new product review
router.route("/review").put(isAuthenticateUser, createProductReview);

//Get product review and Delete review routes
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticateUser, deleteReview);

module.exports = router;
