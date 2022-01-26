const express = require("express");

const { newOrder } = require("../controllers/orderController");
const { isAuthenticateUser } = require("../middleware/auth");

const router = express.Router();

//Create new order
router.route("/order/new").post(isAuthenticateUser, newOrder);

module.exports = router;
