const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((data) => {
      console.log(`CONNECTED TO MongoDB and Data: ${data}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDB;
