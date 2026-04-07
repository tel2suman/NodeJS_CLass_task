
const Inventory = require("../models/inventory");

const StatusCode = require("../utils/StatusCode");


class InventoryController {
  // create category
  async CreateProduct(req, res) {
    try {
      const { name, category, price, stock } = req.body;

      //validate all fields
      if (!name || !category || !price || !stock) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existProduct = await Inventory.findOne({ name });

      if (existProduct) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Inventory already exist",
        });
      }

      const inventorydata = new Inventory({
        name,
        category,
        price,
        stock,
      });

      const data = await inventorydata.save();

      return res.status(StatusCode.SUCCESS).json({
        message: "Inventory added successfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //view record

}

module.exports = new InventoryController();
