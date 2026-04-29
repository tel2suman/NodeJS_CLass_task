
const Category = require("../models/Category");

const StatusCode = require("../utils/StatusCode");


class CategoryController {

    async createCategory(req, res) {

        try {

            const { categoryName, description } = req.body;

            if (!categoryName) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "Category name is required",
              });
            }

            const exist = await Category.findOne({ categoryName });

            if (exist) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "Category already exists",
              });
            }

            const category = await Category.create({
              categoryName,
              description,
            });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Category created",
                data: category,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getCategories(req, res) {
        try {
          const data = await Category.find({ isActive: true });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                total: data.length,
                data,
            });
        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = new CategoryController();
