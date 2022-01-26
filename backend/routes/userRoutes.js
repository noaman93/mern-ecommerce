const express = require("express");
const {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateUserProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/usersController");
const { isAuthenticateUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logOutUser);

router.route("/me").get(isAuthenticateUser, getUserDetails);

router.route("/password/update").put(isAuthenticateUser, updatePassword);

router.route("/me/update").put(isAuthenticateUser, updateUserProfile);

router
  .route("/admin/users")
  .get(isAuthenticateUser, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticateUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticateUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticateUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
