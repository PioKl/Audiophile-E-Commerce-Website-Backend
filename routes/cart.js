const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");

//Dodawanie do koszyka

router.post("/", auth, async (req, res) => {
  try {
    /* console.log("POST /api/cart called with body:", req.body); */
    const { id, name, price, quantity } = req.body;

    //Walidacja danych wejściowych
    if (!id || !name || !price || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      !Number.isInteger(id) ||
      !Number.isInteger(quantity) ||
      price < 0 ||
      quantity < 1
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    //Sprawdzenie czy istnieje już jakieś zamówienie dla użytkownika
    let order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });

    //Jesli nie istnieje, tworzone jest nowe zamówienie
    if (!order) {
      order = new Order({
        user: req.user.id,
        cart: [],
      });
    }

    //Sprawdzenie, czy dany produkt już istnieje w koszyku
    const itemIndex = order.cart.findIndex((item) => item.id === id);

    //Jeśli produkt już istnieje w koszyku przy dodawaniu to będzie aktualizowana tylko jego ilość
    if (itemIndex > -1) {
      //Produkt istnieje - aktualizacja ilości
      order.cart[itemIndex].quantity += quantity;
    } else {
      //Dodawanie nowego produktu do koszyka
      order.cart.push({ id, name, price, quantity });
    }

    await order.save();

    //Aktualizacja pola orders w dokumencie użytkownika
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { orders: order._id } }, //$addToSet zapobiega duplikatom
      { new: true }
    );

    res.status(200).json({ cart: order.cart });
  } catch (error) {
    console.error("Error in POST /cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Edytowanie ilości produktu w koszyku
router.put("/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = order.cart.findIndex(
      (item) => item.id === parseInt(itemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    order.cart[itemIndex].quantity = quantity;
    await order.save();

    res.status(200).json({ cart: order.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Usuwanie produktu z koszyka
router.delete("/:itemId", auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = order.cart.findIndex(
      (item) => item.id === parseInt(itemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    order.cart.splice(itemIndex, 1);
    await order.save();

    res.status(200).json({ cart: order.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Usunięcie wszystkich produktów z koszyka
router.delete("/", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });
    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    //Wyczyszczenie całej tablicy cart
    order.cart = [];
    await order.save();

    res.status(200).json({ cart: order.cart });
  } catch (error) {
    console.error("Error in deleting all products", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Pobieranie zawartości koszyka
router.get("/cart", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (!order) {
      return res.status(200).json({ cart: [] });
    }

    res.status(200).json({ cart: order.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
