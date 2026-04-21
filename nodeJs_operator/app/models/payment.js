
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },

    paidAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    versionKey: false,
  },
);

const PaymentModel = mongoose.model("payment", PaymentSchema);

module.exports = PaymentModel;