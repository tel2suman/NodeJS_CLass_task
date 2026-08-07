
const { Product } = require("../models/product");

const StatusCode = require("../utils/StatusCode");

class ProductController {
  async createProduct(req, res) {
    try {
      const { name, price, description } = req.body;

      const product = new Product({
        name,
        price,
        description,
      });

      await product.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProduct(req, res) {

    try {
      const product = await Product.findAll();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Product get successfully",
        data: product,
      });

    } catch (err) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }
}

module.exports = new ProductController();