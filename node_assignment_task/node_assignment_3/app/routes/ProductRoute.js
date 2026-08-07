
const express = require("express");

const ProductController = require("../controllers/ProductController");

const router = express.Router();

// Create Product
/**
 * @swagger
 * /create/product:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Product data
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - price
 *             - categoryId
 *             - stock
 *           properties:
 *             name:
 *               type: string
 *               example: iPhone 15
 *             price:
 *               type: number
 *               example: 79999
 *             categoryId:
 *               type: string
 *               example: 665f1c2e9d8a123456789abc
 *             stock:
 *               type: number
 *               example: 20
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.post("/create/product", ProductController.createProduct);

/**
 * @swagger
 * /all-product:
 *  get:
 *    summary: Get all the product from Database
 *    tags:
 *       - Product
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: data fetched successfully.
 */

// View Product
router.get("/all-product", ProductController.viewProduct);

/**
 * @swagger
 * /update/product/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags:
 *       - Product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

// Update Product
router.put("/update/product/:id", ProductController.updateProduct);

/**
 * @swagger
 * /delete/product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags:
 *       - Product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

// Delete Product
router.delete("/delete/product/:id", ProductController.deleteProduct);

/**
 * @swagger
 * /product/with/category:
 *  get:
 *    summary: shoe Products with Category
 *    tags:
 *       - Product
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: list of products for that category.
 */

router.get("/product/with/category", ProductController.GetProductWithCategory);

/**
 * @swagger
 * /product/with/stock:
 *  get:
 *    summary: show List of products whose stock is less than 1
 *    tags:
 *       - Product
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: List of products whose stock is less than 1.
 */

// Customers who placed more than 3 orders
router.get("/product/with/stock", ProductController.getProductStock);

/**
 * @swagger
 * /send-products-email:
 *   post:
 *     summary: Send product list email
 *     tags:
 *       - Product
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Send email request
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               example: user@example.com
 *     responses:
 *       201:
 *         description: Product email sent successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */

router.post("/send-products-email", ProductController.sendProductListEmail);

module.exports = router;

