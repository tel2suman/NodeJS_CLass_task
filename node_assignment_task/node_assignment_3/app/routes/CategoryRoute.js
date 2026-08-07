
const express = require("express");

const categoryController = require("../controllers/CategoryController");

const authChek = require("../middleware/authCheck");

const router = express.Router();

/**
 * @swagger
 * /create/category:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Category
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Category data
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - categoryName
 *             - description
 *           properties:
 *             categoryName:
 *               type: string
 *               example: iPhone 15
 *             description:
 *               type: string
 *               example: this is the category description
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.post("/create/category", authChek, categoryController.createCategory);

/**
 * @swagger
 * /view/category:
 *  get:
 *    summary: Get all the categories from Database
 *    tags:
 *       - Category
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: category fetched successfully.
 */

router.get("/view/category", authChek, categoryController.getCategories);

module.exports = router;
