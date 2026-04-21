
const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
      required: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "author",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 🔥 Prevent duplicate likes (same author cannot like same blog twice)
LikeSchema.index({ blogId: 1, authorId: 1 }, { unique: true });

const Like = mongoose.model("like", LikeSchema);

module.exports = Like;
