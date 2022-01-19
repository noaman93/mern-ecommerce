const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const sendToken = require("../utils/jwtToken");

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

module.exports = {
  registerUser,
  loginUser,
};
