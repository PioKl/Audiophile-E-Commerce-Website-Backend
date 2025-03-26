require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("../routes/auth");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000"], //Domeny frontendowe, Frontend lokalny
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], //Dozwolone metody HTTP
    allowedHeaders: ["Content-Type", "Authorization"], //Dozowlone nagłówkie
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ścieżki/Trasy dla routera
app.use("/api/auth", authRoutes);

//Połączenie z MongoDB

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
    process.exit(1); //Zamknij serwer w przypadku błędu połączenia z bazą danych
  });

//Endpoint testowy
app.get("/api/audiophileData", (req, res) => {
  res.send("API is working!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Eksportowanie aplikacji (ważne dla Vercel)
module.exports = app;
