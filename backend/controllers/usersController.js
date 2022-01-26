const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");

const { BadRequestError, NotFoundError } = require("../errors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

//Register a new User
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This is public id",
      url: "This is avatar url",
    },
  });

  //creating token and saving in Cookie
  sendToken(user, 200, res);
};

//Login user
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please Enter Email & Password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new BadRequestError("Invalid Email or Password");
  }

  const isPassworsMatched = await user.comparePassword(password);

  if (!isPassworsMatched) {
    throw new BadRequestError("Invalid Email or Password");
  }

  //creating token and saving in Cookie
  sendToken(user, 200, res);
};

//Logout user
const logOutUser = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
};

//Forgot Password
const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new BadRequestError(
      `No user exists with the given id : ${req.body.email}`
    );
  }

  //Get Reset Password Token
  const resetToken = user.getResetPasswordToken();
  //because in getResetPasswordToken above we change two properties of existing user
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `http://localhost:9000/api/v1/password/reset/${resetToken}`;
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password reset Token is : - 
  \n${resetPasswordUrl}
  \nIf you have not requested this email then, please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to the ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json({ msg: "Reset Email send failed due to Server error" });
  }
};

//Reset Password
const resetPassword = async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError(
      `Reset password token is invalid or has been expired`
    );
  }

  if (!req.body.password || !req.body.confirmPassword) {
    throw new BadRequestError(
      `Password does not mach with confirm password field`
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    throw new BadRequestError(
      `Password does not mach with confirm password field`
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
};

//Get user details
const getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
};

// Update user password
const updatePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  // console.log(user);

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  // console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    throw new BadRequestError(`Old Password is incorrect`);
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    throw new BadRequestError(`Password does not match`);
  }
  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
};

//Update user Profile
const updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  const newUserData = {
    name,
    email,
  };

  //We will add cloudniary Avatar later

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
  });

  res.status(200).json({
    success: true,
  });
};

//Get all users (Admin wants to see all usesr)
const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

//Get single user (Admin wants to see a single user)
const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new BadRequestError(`User does not exist with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    user,
  });
};

//Update user Role  ---- Admin
const updateUserRole = async (req, res) => {
  const { name, email, role } = req.body;

  const newUserData = {
    name,
    email,
    role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res.status(200).json({
    success: true,
  });
};

//Delete user   ---- Admin
const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new BadRequestError(`User does not exist with ID: ${req.params.id}`);
  }

  await User.findByIdAndDelete(id);

  // await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
};

module.exports = {
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
};
