const Blog = require("../models/blog");

const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const mongoose = require('mongoose');

const StatusCode = require("../utils/StatusCode");

const Comment = require("../models/comment");

const Like = require("../models/like");

class BlogController {

  async blogOperations(req, res) {

    try {

      const method = req.method;

      switch (method) {

        //POST → create
        case "POST": {
          const { title, content, authorId, categoryId } = req.body;

          //validate all fields
          if (!title || !content || !authorId || !categoryId) {
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
            categoryId,
          });

          const data = await blogdata.save();

          // Your record creation logic here
          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "Blog created successfully.",
            data: data,
          });
        }

        //GET → get all blogs
        case "GET": {

          const data = await Blog.find();

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "blog listing is here",
            total: data.length,
            data: data,
          });
        }

        //PUT → update
        case "PUT": {
          const { blogId } = req.params;

          const { title, content } = req.body;

          const blog = await Blog.findById(blogId);

          if (!blog) {
            return res.status(StatusCode.NOT_FOUND).json({
              success: false,
              message: "Blog not found",
            });
          }

          // 🔐 Ownership check
          if (blog.authorId !== req.user.id) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "You are not allowed to update this blog",
            });
          }

          // 🖼️ If new image uploaded
          if (req.file) {
            // ✅ Delete old image from Cloudinary
            if (blog.cloudinary_id) {
              await cloudinary.uploader.destroy(blog.cloudinary_id);
            }

            // ✅ Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: "uploads",
              width: 500,
              height: 500,
              crop: "limit",
              quality: "auto",
            });

            // ✅ Remove local file
            if (req.file.path) {
              await fs.promises.unlink(req.file.path);
            }

            // ✅ Update image fields
            blog.image = result.secure_url;
            blog.cloudinary_id = result.public_id;
          }

          // 📝 Update text fields
          if (title) blog.title = title;

          if (content) blog.content = content;

          await blog.save();

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
          });
        }

        //DELETE → delete
        case "DELETE": {
          const { blogId } = req.params;

          const blog = await Blog.findById(blogId);

          if (!blog) {
            return res.status(404).json({
              success: false,
              message: "Blog not found",
            });
          }

          // 🔐 Ownership check
          if (blog.authorId !== req.user.id) {
            return res.status(403).json({
              success: false,
              message: "You are not allowed to delete this blog",
            });
          }

          // 🖼️ Delete image from Cloudinary (safe)
          if (blog.cloudinary_id) {
            try {
              await cloudinary.uploader.destroy(blog.cloudinary_id);
            } catch (err) {
              console.log("Cloudinary delete failed:", err.message);
              // ❗ don't stop execution
            }
          }

          // 🗑️ Delete blog
          await Blog.findByIdAndDelete(blogId);

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "Blog and image deleted successfully",
          });
        }
      }
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // async createBlog(req, res) {

  //   try {

  //     const { title, content, authorId, categoryId } = req.body;

  //     if (!title || !content || !authorId ||!categoryId) {
  //       return res.status(StatusCode.BAD_REQUEST).json({
  //         success: false,
  //         message: "all fields are required",
  //       });
  //     }

  //     if (!req.file) {
  //       return res.status(StatusCode.BAD_REQUEST).json({
  //         success: false,
  //         message: "Image is required",
  //       });
  //     }

  //     const existPost = await Blog.findOne({ title });

  //     if (existPost) {
  //       return res.status(StatusCode.BAD_REQUEST).json({
  //         success: false,
  //         message: "blog already exist",
  //       });
  //     }

  //     const imageResult = await cloudinary.uploader.upload(req.file.path, {
  //       folder: "uploads",
  //       width: 500,
  //       height: 500,
  //       crop: "limit",
  //       quality: "auto",
  //     });

  //     if (req.file && req.file.path) {
  //       await fs.promises.unlink(req.file.path);
  //     }

  //     const blogdata = new Blog({
  //       title,
  //       content,
  //       image: imageResult ? imageResult.secure_url : null,
  //       cloudinary_id: imageResult ? imageResult.public_id : null,
  //       authorId,
  //       categoryId,
  //     });

  //     const data = await blogdata.save();

  //     return res.status(StatusCode.SUCCESS).json({
  //       success: true,
  //       message: "Blog created successfully.",
  //       data: data,
  //     });

  //   } catch (error) {
  //     return res.status(StatusCode.SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }


  //view record
  // async viewAllBlog(req, res) {
  //   try {
  //     const data = await Blog.find();

  //     return res.status(StatusCode.SUCCESS).json({
  //       success: true,
  //       message: "blog listing is here",
  //       total: data.length,
  //       data: data,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // update blog
  // async updateBlog(req, res) {
  //   try {
  //     const { blogId } = req.params;

  //     const { title, content } = req.body;

  //     const blog = await Blog.findById(blogId);

  //     if (!blog) {
  //       return res.status(StatusCode.NOT_FOUND).json({
  //         success: false,
  //         message: "Blog not found",
  //       });
  //     }


  //     if (blog.authorId !== req.user.id) {
  //       return res.status(StatusCode.BAD_REQUEST).json({
  //         success: false,
  //         message: "You are not allowed to update this blog",
  //       });
  //     }

  //     if (req.file) {
  //       // ✅ Delete old image from Cloudinary
  //       if (blog.cloudinary_id) {
  //         await cloudinary.uploader.destroy(blog.cloudinary_id);
  //       }

  //       const result = await cloudinary.uploader.upload(req.file.path, {
  //         folder: "uploads",
  //         width: 500,
  //         height: 500,
  //         crop: "limit",
  //         quality: "auto",
  //       });

  //       if (req.file.path) {
  //         await fs.promises.unlink(req.file.path);
  //       }

  //       blog.image = result.secure_url;
  //       blog.cloudinary_id = result.public_id;
  //     }

  //     if (title) blog.title = title;

  //     if (content) blog.content = content;

  //     await blog.save();

  //     return res.status(StatusCode.SUCCESS).json({
  //       success: true,
  //       message: "Blog updated successfully",
  //       data: blog,
  //     });
  //   } catch (error) {
  //     return res.status(StatusCode.SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  //delete blog
  // async deleteBlog(req, res) {
  //   try {
  //     const { blogId } = req.params;

  //     const blog = await Blog.findById(blogId);

  //     if (!blog) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Blog not found",
  //       });
  //     }

  //     if (blog.authorId !== req.user.id) {
  //       return res.status(403).json({
  //         success: false,
  //         message: "You are not allowed to delete this blog",
  //       });
  //     }

  //     if (blog.cloudinary_id) {
  //       try {
  //         await cloudinary.uploader.destroy(blog.cloudinary_id);
  //       } catch (err) {
  //         console.log("Cloudinary delete failed:", err.message);
  //       }
  //     }


  //     await Blog.findByIdAndDelete(blogId);

  //     return res.status(StatusCode.SUCCESS).json({
  //       success: true,
  //       message: "Blog and image deleted successfully",
  //     });
  //   } catch (error) {
  //     return res.status(StatusCode.SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

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

  async addComment(req, res) {
    try {
      const { blogId, comment } = req.body;

      if (!blogId || !comment) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "blogId and comment are required",
        });
      }

      // check blog exists
      const blog = await Blog.findById(blogId);

      if (!blog) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Blog not found",
        });
      }

      const newComment = await Comment.create({
        blogId,
        authorId: req.user.id, // 🔐 from auth
        comment,
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Comment added successfully",
        data: newComment,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCommentsByBlog(req, res) {
    try {
      const { blogId } = req.params;

      const lookupQuery = [
        {
          $match: {
            blogId: new mongoose.Types.ObjectId(blogId),
          },
        },
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails",
          },
        },
        {
          $unwind: "$authorDetails",
        },
        {
          $project: {
            comment: 1,
            createdAt: 1,
            "authorDetails.name": 1,
            "authorDetails.email": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      const data = await Comment.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Comments fetched successfully",
        total: data.length,
        data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async toggleLike(req, res) {
    try {
      const { blogId } = req.body;

      const authorId = req.user.id; // 🔐 from auth

      if (!blogId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "blogId is required",
        });
      }

      const existingLike = await Like.findOne({ blogId, authorId });

      if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Blog unliked",
        });
      }

      await Like.create({ blogId, authorId });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Blog liked",
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLikesCountByBlog(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "blogId",
            as: "likes",
          },
        },
        {
          $addFields: {
            likeCount: { $size: "$likes" },
          },
        },
        {
          $project: {
            title: 1,
            likeCount: 1,
          },
        },
      ];

      const data = await Blog.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Likes fetched successfully",
        total: data.length,
        data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async approveBlog(req, res) {

    try {

      const { blogId } = req.params;

      const blog = await Blog.findById(blogId);

      if (!blog) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Blog not found",
        });
      }

      blog.status = "approved";

      await blog.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Blog approved successfully",
        data: blog,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async rejectBlog(req, res) {

    try {

      const { blogId } = req.params;

      const blog = await Blog.findById(blogId);

      if (!blog) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Blog not found",
        });
      }

      blog.status = "rejected";

      await blog.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Blog rejected",
        data: blog,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getBlogsByCategory(req, res) {

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
          $group: { _id: "$categoryId",
            total: { $sum: 1 } },
        },
      ];

      const result = await Blog.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Blogs fetched by category",
        data: result,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getApprovedBlogs(req, res) {

    try {

      const lookupQuery = [
        // ✅ Only approved blogs
        {
          $match: { status: "approved" },
        },

        // 👤 Author details
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        // 📂 Category
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        // ❤️ Likes
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "blogId",
            as: "likes",
          },
        },
        {
          $addFields: {
            likeCount: { $size: "$likes" },
          },
        },
        // 💬 Comments
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "blogId",
            as: "comments",
          },
        },
        // 👤 Comment author details
        {
          $lookup: {
            from: "authors",
            localField: "comments.authorId",
            foreignField: "_id",
            as: "commentAuthors",
          },
        },
        // 🔄 Merge comment + author
        {
          $addFields: {
            comments: {
              $map: {
                input: "$comments",
                as: "c",
                in: {
                  comment: "$$c.comment",
                  createdAt: "$$c.createdAt",
                  author: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$commentAuthors",
                          as: "a",
                          cond: { $eq: ["$$a._id", "$$c.authorId"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        // 🧹 Clean output
        {
          $project: {
            title: 1,
            content: 1,
            image: 1,
            createdOn: 1,
            likeCount: 1,
            comments: 1,
            "author.name": 1,
            "category.name": 1,
          },
        },
        {
          $sort: { createdOn: -1 },
        },
      ];

      const data = await Blog.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          total: data.length,
          data,
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