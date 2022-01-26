const express = require("express");

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isAuthenticateUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

//Create new order
router.route("/order/new").post(isAuthenticateUser, newOrder);

//get single order
router.route("/order/:id").get(isAuthenticateUser, getSingleOrder);

//get loggedIn user orders
router.route("/orders/me").get(isAuthenticateUser, myOrders);

//get all orders Admin
router
  .route("/admin/orders")
  .get(isAuthenticateUser, authorizeRoles("admin"), getAllOrders);

//update order Status Admin
router
  .route("/admin/order/:id")
  .put(isAuthenticateUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
