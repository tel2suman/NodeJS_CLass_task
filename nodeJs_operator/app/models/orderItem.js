
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },

    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "inventory",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    versionKey: false,
  },
);

const OrderItemModel = mongoose.model("orderItem", OrderItemSchema);

module.exports = OrderItemModel;