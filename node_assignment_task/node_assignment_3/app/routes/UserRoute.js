const express = require("express");

const UserController = require("../controllers/UserController");

const authChek = require("../middleware/authCheck");

const Upload = require("../utils/CloudinaryImageUpload");

const router = express.Router();

/**
 * @swagger
 * /register/user:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - User restful API
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         description: Name of the user
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         description: user email
 *         required: true
 *       - in: formData
 *         name: phone
 *         type: string
 *         description: Phone No. of the user
 *         required: true
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Profile image of the user
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         description: Password of the user
 *         required: true
 *     responses:
 *       200:
 *         description: User data added successfully
 *       400:
 *         description: Bad Request (e.g., missing fields or incorrect data)
 *       500:
 *         description: Server Error
 */

router.post("/register/user", Upload.single("image"), UserController.registerUser);

/**
 * @swagger
 * /verify/user:
 *   post:
 *     summary: Verify user's email with OTP
 *     tags:
 *       - Auth restful API
 *     parameters:
 *       - in: body
 *         name: otp
 *         description: One-Time Password sent to user's email
 *         required: true
 *         type: string
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               required: true
 *             otp:
 *               type: string
 *               required: true
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Bad Request (e.g., invalid OTP or user already verified)
 */

router.post("/verify/user", UserController.verifyUser);

/**
 * @swagger
 * /login/user:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth restful API
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User login credentials
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: Email of the user
 *               example: user@example.com
 *             password:
 *               type: string
 *               description: Password of the user
 *               example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized (user is not authenticated)
 */

router.post("/login/user", UserController.loginUser);

router.use(authChek);

/**
 * @swagger
 * /user/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/user/profile/:id", UserController.getUserProfile);

/**
 * @swagger
 * /update/profile/{id}:
 *   put:
 *     summary: Update user profile by ID
 *     tags:
 *       - User restful API
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         description: Name of the user
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         description: user email
 *         required: true
 *       - in: formData
 *         name: phone
 *         type: string
 *         description: Phone No. of the user
 *         required: true
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Profile image of the user
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         description: Password of the user
 *         required: true
 *     responses:
 *       200:
 *         description: User data updated successfully
 *       400:
 *         description: Bad Request (e.g., missing required fields)
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

router.put("/update/profile/:id", Upload.single("image"), UserController.updateUser);

module.exports = router;