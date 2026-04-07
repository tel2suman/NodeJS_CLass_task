
const Category = require("../models/Category");

const SubCategory = require("../models/subCategory");
const StatusCode = require("../utils/StatusCode");

class LookupController {

  // create category
  async CreateCategory(req, res) {

    try {

      const data = await Category.create(req.body);

      return res.status(StatusCode.SUCCESS).json({
        message: "Category created successfully",
        data: data,
      });

    } catch (error) {

      console.log(error.message);
    }
  }

  // get category
  async getCategory(req, res) {

    try {

      const data = await Category.find();

        return res.status(StatusCode.SUCCESS).json({
            message: "Category get successfully",
            data: data,
            total: data.length
        });

    } catch (error) {

      console.log(error.message);
    }
  }

  //subcategory
  async CreateSubCategory(req, res) {

    try {

        const { subCategoryName, categoryId } = req.body;

        const data = new SubCategory({
            subCategoryName,
            categoryId,
        });

        await data.save();

        return res.status(StatusCode.SUCCESS).json({
            message: "subCategory created successfully",
            data: data,
        });

    } catch (error) {

      console.log(error.message);
    }

  }

  //create subcategorywithcategory
  async CreateSubCategoryWithCategory(req, res) {

    try {

      const lookupQuery = [
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $project: {
            subCategoryName: 1,
            "category.categoryName": 1,
          },
        },
        {
          $unwind: "$category",
        },
        {
          $group: {
            _id: "$category.categoryName",
            subCategories: {
              $push: {
                subCategoryName: "$subCategoryName",
              },
            },
            total: {
              $sum: 1,
            },
          },
        },
      ];

      const Subcategory = await SubCategory.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "subCategory created successfully",
        data: Subcategory,
      });

    } catch (error) {

      console.log(error.message);
    }

  }


}

module.exports = new LookupController();