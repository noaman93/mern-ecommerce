const Product = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const ApiFeatures = require("../utils/apiFeatures");

//GET all Products
const getAllProducts = async (req, res, next) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeatures.query;
  const count = products.length;
  res.status(200).json({
    success: true,
    count,
    products,
    productCount,
  });
};

//CREATE a new Product  ---> Admin
const createProduct = async (req, res, next) => {
  const product = await Product.create(req.body);

  //201 means created
  res.status(201).json({
    success: true,
    product,
  });
};

//Update Product   ---> Admin
const updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    updatedProduct,
  });
};

//Delete Product
const deleteProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    mesage: "Product deleted successfully",
  });
};

//Get Product Details
const productDetails = async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    product,
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productDetails,
};
