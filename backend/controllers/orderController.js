const Order = require("../models/Order");
const Product = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

//Create new order
exports.newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  //201 means CREATED
  res.status(201).json({
    success: true,
    order,
  });
};

//get single order
exports.getSingleOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    throw new NotFoundError(
      `Order not found with the given ID: ${req.params.id}`
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
};

//get loggedIn user orders
exports.myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
};

//get all orders -- Admin
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount = totalAmount + order.totalPrice;
  });

  res.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
};

//Update order Status -- Admin
exports.updateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new NotFoundError(
      `Order not found with the given ID: ${req.params.id}`
    );
  }

  if (order.orderStatus === "Delivered") {
    throw new BadRequestError(`You have already delivered this order`);
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.orderStatus;

  if (req.body.orderStatus === "Delivered") {
    // order.orderStatus = "Delivered";
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

//delete order admin
exports.deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new NotFoundError(
      `Order not found with the given ID: ${req.params.id}`
    );
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
};
