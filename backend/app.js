const express = require("express");
const cookieParser = require("cookie-parser");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.use(express.json());
app.use(cookieParser());

//Route Imports
const productsRoutes = require("./routes/productRoutes");
const usersRoutes = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");

app.use("/api/v1", productsRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", order);

//Middleware for Errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
