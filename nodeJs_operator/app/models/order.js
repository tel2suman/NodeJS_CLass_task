const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
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

const OrderModel = mongoose.model("order", OrderSchema);

module.exports = OrderModel;