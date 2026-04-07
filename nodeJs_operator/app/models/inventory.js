
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const InventoryModel = mongoose.model("inventory", InventorySchema);

module.exports = InventoryModel;
