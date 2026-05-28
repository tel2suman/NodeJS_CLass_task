const Category = require("../models/Category");

const StatusCode = require("../utils/StatusCode");

class CategoryController {

    async createCategory(req, res) {

        try {

            const { categoryName, categoryDescription, taskId, userId, labelId } = req.body;

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
              categoryDescription,
              taskId,
              userId,
              labelId,
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

            const data = await Category.find();

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

    // update product
      async updateCategory(req, res) {

        try {

          const id = req.params.id;

          if (!id) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "oops, category id required!",
            });
          }

          const data = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
          });

          // Handle logic
            res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "category updated successfully",
                data: data,
            });
        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
      }

      // delete product
      async deleteCategory(req, res) {

        try {

          const id = req.params.id;

            if (!id) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "oops, category id required!",
                });
            }

          const data = await Category.findByIdAndDelete(id);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "category deleted succesfully",
                data: data,
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