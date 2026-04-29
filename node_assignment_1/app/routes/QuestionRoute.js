const express = require("express");

const questionController = require("../controllers/QuestionController");

const authChek = require("../middleware/authCheck");

const router = express.Router();

router.post("/create/question", authChek, questionController.createQuestion);

router.post("/user/submit/answer", authChek, questionController.userSubmitAnswer);

router.get("/view/question/category", authChek, questionController.getListOfQuestionsWithCat);

router.get(
  "/search/question/user", authChek,
  questionController.searchQuestionsWithAnswers,
);

router.get(
  "/category/question/count", authChek,
  questionController.getTotalQuestionsCount,
);

module.exports = router;