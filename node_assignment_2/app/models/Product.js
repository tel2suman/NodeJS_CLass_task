const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({

    name: {
        type: String,
        required: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: "category",
    },

    description: {
        type: String,
        required: true,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
});

const ProductModel = mongoose.model("product", ProductSchema);

module.exports = ProductModel;
