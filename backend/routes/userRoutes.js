const express = require("express");
const {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
} = require("../controllers/usersController");
const { isAuthenticateUser } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logOutUser);

router.route("/me").get(isAuthenticateUser, getUserDetails);

router.route("/password/update").put(isAuthenticateUser, updatePassword);

module.exports = router;
