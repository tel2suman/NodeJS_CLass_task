const Product = require("../models/Product");

const Category = require("../models/Category");

const StatusCode = require("../utils/StatusCode");

const nodemailer = require("nodemailer");

class ProductController {
  // create product
  async createProduct(req, res) {
    try {
      const { name, price, stock, categoryId } = req.body;

      if (!name || !price || !stock || !categoryId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      // Numeric validation
      if (price <= 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Price must be greater than 0",
        });
      }

      if (stock < 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }

      // Check duplicate product
      const existingProduct = await Product.findOne({
        name: name.trim(),
      });

      if (existingProduct) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Product already exists",
        });
      }

      // Create product
      const product = await Product.create({
        name: name.trim(),
        price,
        stock,
        categoryId,
      });

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // view product
  async viewProduct(req, res) {
    try {
      const data = await Product.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "all products are here",
        total: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // update product
  async updateProduct(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      // Handle logic
      res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "product updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // delete product
  async deleteProduct(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Product.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "product deleted succesfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //show product with Category
  async GetProductWithCategory(req, res) {
    try {
      const lookupQuery = [
        // Join products
        {
          $lookup: {
            from: "products", // collection name
            localField: "_id",
            foreignField: "categoryId",
            as: "products",
          },
        },

        // Add total product count
        {
          $addFields: {
            totalProducts: { $size: "$products" },
          },
        },

        // Optional fields selection
        {
          $project: {
            name: 1,
            totalProducts: 1,
            products: {
              _id: 1,
              name: 1,
              price: 1,
              stock: 1,
            },
          },
        },
      ];

      const categories = await Category.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "list of products for that category",
        data: categories,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProductStock(req, res) {
    try {
      const lookupQuery = [
        // Filter products whose stock is less than 1
        {
          $match: {
            stock: { $lt: 1 },
          },
        },
        // Join category details
        {
          $lookup: {
            from: "categories", // category collection
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        // Convert category array into object
        {
          $unwind: "$category",
        },
        // Select required fields
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            stock: 1,
            "category._id": 1,
            "category.name": 1,
          },
        },
      ];

      const result = await Product.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "List of products whose stock is less than 1",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async sendProductListEmail(req, res) {

    try {
      const { email } = req.body;

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
          $unwind: "$category",
        },
        {
          $project: {
            name: 1,
            price: 1,
            stock: 1,
            categoryName: "$category.name",
          },
        },
      ];

      const products = await Product.aggregate(lookupQuery);

      if (products.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No products found",
        });
      }

      // Generate HTML table
      let tableRows = "";

      products.forEach((product, index) => {
        tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name}</td>
          <td>₹${product.price}</td>
          <td>${product.stock}</td>
          <td>${product.categoryName}</td>
        </tr>
      `;
      });

      const htmlTemplate = `
      <h2>Product List</h2>
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>#</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
          </tr>
        </thead>

        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

      // Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "All Product List",
        html: htmlTemplate,
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Product list email sent successfully",
        data: products,
      });
      
    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
    }
  }
}


module.exports = new ProductController();