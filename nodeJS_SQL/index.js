const express = require("express");

const sequelize = require("./app/config/db");

require("./app/models/index");

const app = express();

app.use(express.json());

const ProductRoute = require("./app/routes/ProductRoute");

app.use(ProductRoute);

const port = 3002;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error(" DB connection error:", err));
