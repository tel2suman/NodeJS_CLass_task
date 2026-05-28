const Label = require("../models/Label");

const Category = require("../models/Category");

const Task = require("../models/Task");

const StatusCode = require("../utils/StatusCode");

const mongoose = require("mongoose");

class LabelController {

    async createLabel(req, res) {

        try {

            const { labelName, labelDesc, categoryId, userId } = req.body;

            if (!labelName) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "label name is required",
              });
            }

            const exist = await Label.findOne({ labelName });

            if (exist) {
                    return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "label already exists",
                });
            }

            const label = await Label.create({
              labelName,
              labelDesc,
              categoryId,
              userId,
            });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Label created",
                data: label,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    //show Category with Labels For User
  async GetCategoryWithLabelsForUser(req, res) {

    try {

        const lookupQuery = [
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user._id)
            },
          },

          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },

          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              _id: 1,
              labelName: 1,
              labelDesc: 1,
              createdAt: 1,

              "category._id": 1,
              "category.categoryName": 1,
              "category.categoryDescription": 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ];

        const labels = await Label.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "List of categories with labels",
          totalLabels: labels.length,
          data: labels,
        });

    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }
}

module.exports = new LabelController();