const express = require("express");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.use(express.json());

//Route Imports
const productsRoutes = require("./routes/productRoutes");
const usersRoutes = require("./routes/userRoutes");

app.use("/api/v1", productsRoutes);
app.use("/api/v1", usersRoutes);

//Middleware for Errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
