const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    checkoutData: {
      name: { type: String, required: true },
      emailAddress: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      zipCode: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      paymentMethod: {
        type: String,
        required: true,
        enum: ["e-money", "cash on delivery"],
      },
      eMoneyNumber: {
        type: String,
        required: function () {
          return this.paymentMethod === "e-money";
        },
      },
      eMoneyPin: {
        type: String,
        required: function () {
          return this.paymentMethod === "e-money";
        },
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true } //createdAt i updatedAt, czyli kiedy zostało zamówienie utworzone, aktualizowane
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
