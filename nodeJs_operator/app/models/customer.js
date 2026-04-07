
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid email"],
    },

    city: {
      type: String,
      required: true,
    },

  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CustomerModel = mongoose.model("customer", CustomerSchema);

module.exports = CustomerModel;