
const express = require("express");

const MovieController = require("../controllers/MovieController");

const authChek = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authChek);

router.post("/create-movie", Rolechek("admin"), MovieController.createMovie);

router.get("/all-movie", MovieController.viewAllMovie);

router.put(
  "/update-movie/:id",
  Rolechek("admin"),
  MovieController.updateMovieDetails,
);

router.delete(
  "/delete-movie/:id",
  Rolechek("admin"),
  MovieController.deleteMovie,
);


module.exports = router;
