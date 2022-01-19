const dotenv = require("dotenv");
require("express-async-errors");

const app = require("./app");
const connectDB = require("./config/database");

//configuring .env file
dotenv.config({ path: "backend/config/config.env" });

//connect to MongoDB
connectDB();

const port = process.env.PORT || 4000;

// app.get("/", (req, res) => {
//   res.json({ message: "I am home page" });
// });

app.listen(port, () => {
  console.log(`SERVER LISTENING AT PORT : ${port}`);
});
