const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },

    stock: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

const ProductModel = mongoose.model("product", ProductSchema);

module.exports = ProductModel;
