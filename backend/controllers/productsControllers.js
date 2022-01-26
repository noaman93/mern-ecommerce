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
  req.body.user = req.user._id;
  // console.log(req.user);

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

//Create New Review or Update the Review
const createProductReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

//Get all Reviews of a Product
const getProductReviews = async (req, res) => {
  //hum ny as query id deni hai
  const product = await Product.findById(req.query.id);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.query.id}`);
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

//Delete Reviews of a Product
const deleteReview = async (req, res) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    throw new NotFoundError(`Product not found with id ${req.query.productId}`);
  }

  const reviews = product.reviews.filter(
    //req.query.id  will be the id of the review which is a {} in model
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });

  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
};
