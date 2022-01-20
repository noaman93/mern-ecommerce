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

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  forgotPassword,
  resetPassword,
};
