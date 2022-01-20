const jwt = require("jsonwebtoken");

const { UnauthenticatedError } = require("../errors");
const User = require("../models/User");

exports.isAuthenticateUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError("Please Login to access this resource");
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthenticatedError(
        `Role: ${req.user.role} is not allowed to access this resource`
      );
    }

    next();
  };
};
