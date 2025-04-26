const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");

//Przeniesienie koszyka do checkoutData oraz wyczyszczenie koszyka

router.post("/checkout", auth, async (req, res) => {
  try {
    const { checkoutData } = req.body; //Dane checkout od użytkownika (imię, adres, itd.)

    //Aktualne zamówienie z koszykiem
    const order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (!order || order.cart.length === 0) {
      return res.status(404).json({ message: "Cart is empty or not found" });
    }

    order.checkoutData = {
      ...checkoutData, //Dane użytkownika do wysyłki
      boughtProducts: order.cart, //Przeniesienie aktualnej zawartości koszyka
    };

    order.cart = []; //Wyczyszczenie koszyka
    order.status = "completed"; //Status zamówienia zakończone

    await order.save();

    res.status(200).json({ message: "Order completed", order });
  } catch (error) {
    console.error("Error in POST checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Nowy endpoint do pobierania ostatniego zamówienia
router.get("/last-order", auth, async (req, res) => {
  try {
    const lastOrder = await Order.findOne({
      user: req.user.id,
      status: "completed",
    })
      .sort({ updatedAt: -1 }) //Sortuj po updatedAt malejąco
      .lean(); //dane będą tylko do odczytu, więc lean spowoduje, że nie zwrócę niepotrzebnych metod i metadanych, np. save

    if (!lastOrder) {
      return res.status(404).json({ message: "No completed orders found" });
    }
    res.status(200).json({ order: lastOrder });
  } catch (error) {
    console.error("Error in getting last order", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
