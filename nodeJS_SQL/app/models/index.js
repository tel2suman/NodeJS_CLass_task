const sequelize = require("../config/db");

const Product = require("./product");

const Employee = require("./employee");


// Sync all models
sequelize.sync({ alter: true })
  .then(() => console.log("Database synced"))
  .catch(err => console.error(" Error syncing DB:", err));


module.exports = { Product, Employee };