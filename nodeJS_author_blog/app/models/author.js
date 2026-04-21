const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid email"],
    },

    password: {
      type: String,
      minlength: 6,
      required: true,
    },

    about: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "author", "user"],
      default: "author",
    },

    is_verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AuthorModel = mongoose.model("author", AuthorSchema);

module.exports = AuthorModel;