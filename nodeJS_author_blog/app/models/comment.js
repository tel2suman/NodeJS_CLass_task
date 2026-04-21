
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "author",
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CommentModel = mongoose.model("comment", CommentSchema);

module.exports = CommentModel;
