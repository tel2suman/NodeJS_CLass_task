const Label = require("../models/Label");

const Category = require("../models/Category");

const Task = require("../models/Task");

const StatusCode = require("../utils/StatusCode");


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
              userId: req.user.userId,
            },
          },

          {
            $lookup: {
              from: "labels",
              localField: "_id",
              foreignField: "categoryId",
              as: "labels",
            },
          },

          {
            $project: {
              _id: 1,
              categoryName: 1,
              categoryDescription: 1,
              createdAt: 1,

              labels: {
                $map: {
                  input: "$labels",
                  as: "label",
                  in: {
                    _id: "$$label._id",
                    labelName: "$$label.labelName",
                    labelDesc: "$$label.labelDesc",
                    createdAt: "$$label.createdAt",
                  },
                },
              },
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ];

        const categories = await Category.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "List of categories with labels",
          totalCategories: categories.length,
          data: categories,
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