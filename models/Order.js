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
      type: {
        name: { type: String },
        emailAddress: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        zipCode: { type: String },
        city: { type: String },
        country: { type: String },
        paymentMethod: {
          type: String,
          enum: ["e-money", "cash-on-delivery"],
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
        boughtProducts: [
          {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
          },
        ],
      },
      required: false, // checkoutData jest opcjonalne
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
