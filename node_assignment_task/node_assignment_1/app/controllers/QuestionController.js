
const Question = require("../models/Question");

const Answer = require("../models/Answer");

const Category = require("../models/Category");

const StatusCode = require("../utils/StatusCode");


class QuestionController {

    async createQuestion(req, res) {

        try {

            const { question, categoryId } = req.body;

            if (!question) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Question is required",
                });
            }

            const exist = await Question.findOne({ question });

            if (exist) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Question already exists",
                });
            }

            const category = await Question.create({
              question,
              categoryId,
            });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Question is created",
                data: category,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async userSubmitAnswer(req, res) {

        try {

            const { answer, userId, questionId } = req.body;

            if (!answer) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Answer is required",
                });
            }

            const exist = await Answer.findOne({ answer });

            if (exist) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "Answer already exists",
              });
            }

            const submitAnswer = await Answer.create({
              answer,
              userId,
              questionId,
            });

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "Answer is submitted",
              data: submitAnswer,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async getListOfQuestionsWithCat(req, res) {

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
              { $unwind: "$category" },
              {
                $match: {
                  isActive: true,
                  "category.isActive": true,
                },
              },
              {
                $group: {
                  _id: "$category._id",
                  categoryName: { $first: "$category.categoryName" },
                  questions: {
                    $push: {
                      _id: "$_id",
                      question: "$question",
                      answer: "$answer",
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  categoryId: "$_id",
                  categoryName: 1,
                  questions: 1,
                },
              },
            ];

            const aggQnA = await Question.aggregate(lookupQuery);

            return res.status(StatusCode.SUCCESS).json({
              message: "All List Of Questions with category",
              data: aggQnA,
            });

        } catch (error) {
            //console.error("Aggregation Error:", error);
            return res.status(StatusCode.SERVER_ERROR).json({
              success: false,
              message: "Something went wrong",
            });
        }
    }

    async searchQuestionsWithAnswers(req, res) {

        try {

            const userId = req.user.id;

            const { search = "", timezone = "Asia/Kolkata" } = req.query;

            const lookupQuery = [
              // 🔍 Search
              {
                $match: {
                  question: { $regex: search, $options: "i" },
                },
              },

              // 🔗 Join user answers
              {
                $lookup: {
                  from: "answers",
                  localField: "_id",
                  foreignField: "questionId",
                  as: "answers",
                },
              },

              // 🎯 Pick only current user's answer
              {
                $addFields: {
                  userAnswer: {
                    $first: {
                      $filter: {
                        input: "$answers",
                        as: "ans",
                        cond: {
                          $eq: [
                            "$$ans.userId",
                            new mongoose.Types.ObjectId(userId),
                          ],
                        },
                      },
                    },
                  },
                },
              },
              // 🕒 Format time
              {
                $addFields: {
                  submittedAt: {
                    $cond: [
                      "$userAnswer.createdAt",
                      {
                        $dateToString: {
                          format: "%Y-%m-%d %H:%M:%S",
                          date: "$userAnswer.createdAt",
                          timezone: timezone,
                        },
                      },
                      null,
                    ],
                  },
                },
              },
              // 📦 Final output
              {
                $project: {
                  question: 1,
                  correctAnswer: "$answer",
                  userAnswer: "$userAnswer.answer",
                  submittedAt: 1,
                },
              },
            ];

            const aggQnA = await Question.aggregate(lookupQuery);

            return res.status(StatusCode.SUCCESS).json({
              message: "Question with answer submitted by user",
              data: aggQnA,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
              success: false,
              message: "Something went wrong",
            });
        }
    }

    async getTotalQuestionsCount(req, res) {

      try {

        const lookupQuery = [
          // 🔗 Join questions
          {
            $lookup: {
              from: "questions",
              localField: "_id",
              foreignField: "categoryId",
              as: "questions",
            },
          },
          // 🔢 Count questions
          {
            $addFields: {
              totalQuestions: { $size: "$questions" },
            },
          },
          // 📦 Clean response
          {
            $project: {
              categoryName: 1,
              description: 1,
              isActive: 1,
              totalQuestions: 1,
            },
          },
          // 📊 Optional sorting
          {
            $sort: { totalQuestions: -1 },
          },
        ];

        const agg = await Category.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          message: "List of all categories along with total questions",
          data: agg,
          totalCategories: agg.length
        });

      } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }
    }
}

module.exports = new QuestionController();