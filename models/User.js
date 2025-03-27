const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", //Referencja do modelu Order
      },
    ],
  },
  { timestamps: true } //createdAt i updatedAt, czyli kiedy został utworzony użytkownik i zaszła jakaś zmiana
);

const User = mongoose.model("User", userSchema);

module.exports = User;
