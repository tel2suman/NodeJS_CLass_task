
const Blog = require("../models/blog");

const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const StatusCode = require("../utils/StatusCode");

class BlogController {
  async createBlog(req, res) {
    try {
      const { title, content, authorId } = req.body;

      //validate all fields
      if (!title || !content || !authorId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      if (!req.file) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Image is required",
        });
      }

      const existPost = await Blog.findOne({ title });

      if (existPost) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "blog already exist",
        });
      }

      //upload to clodinary
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
        width: 500,
        height: 500,
        crop: "limit",
        quality: "auto",
      });

      // Delete local file after upload (important)
      if (req.file && req.file.path) {
        await fs.promises.unlink(req.file.path);
      }

      const blogdata = new Blog({
        title,
        content,
        image: imageResult ? imageResult.secure_url : null,
        cloudinary_id: imageResult ? imageResult.public_id : null,
        authorId,
      });

      const data = await blogdata.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Blog created successfully.",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //view record
  async viewAllBlog(req, res) {
    try {
      const data = await Blog.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "blog listing is here",
        total: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchBlogsByAuthorName(req, res) {
    try {
      const { name } = req.query;

      const lookupQuery = [
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails",
          },
        },

        { $unwind: "$authorDetails" },

        {
          $match: {
            "authorDetails.name": {
              $regex: name,
              $options: "i", // case-insensitive
            },
          },
        },

        {
          $project: {
            title: 1,
            content: 1,
            createdAt: 1,
            "authorDetails.name": 1,
            "authorDetails.email": 1,
          },
        },

        {
          $sort: { createdAt: -1 },
        },
      ];

      const data = await Blog.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Blogs fetched by author name",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async viewAllBlogsByAuthor(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "authors", // collection name in MongoDB
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails",
          },
        },
        {
          $unwind: "$authorDetails", // convert array → object
        },
        {
          $group: {
            _id: "$authorDetails._id",
            authorName: { $first: "$authorDetails.name" },
            email: { $first: "$authorDetails.email" },
            totalBlogs: { $sum: 1 }, // ✅ added
            blogs: {
              $push: {
                _id: "$_id",
                title: "$title",
                content: "$content",
                createdOn: "$createdOn", // ✅ fixed
              },
            },
          },
        },
        {
          $sort: { totalBlogs: -1 }, // optional but useful
        },
      ];

      const aggblog = await Blog.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Author-wise blog list",
        totalAuthors: aggblog.length,
        data: aggblog,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}


module.exports = new BlogController();