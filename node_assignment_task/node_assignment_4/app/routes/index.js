const express = require("express")

const AuthRoute = require("./authRoutes")
const CategoryRoute = require("./categoryRoutes")
const PostRoute = require("./postRoutes")
const UserRoute = require("./userRoutes")

const router = express.Router()


router.use("/auth", AuthRoute)
router.use("/users", CategoryRoute)
router.use("/categories", PostRoute)
router.use("/posts", UserRoute)


module.exports = router