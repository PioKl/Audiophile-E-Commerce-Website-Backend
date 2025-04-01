const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

//Rejestracja

router.post("/register", async (req, res) => {
  const { userEmail, password, repeatPassword } = req.body;

  const errorsMessages = {
    emailEmpty: false,
    emailTaken: false,
    passwordEmpty: false,
    passwordMinimumCharacters: false,
    passwordCapitalLetterAndSpecialCharacter: false,
    repeatPassword: false,
    passwordsCompare: false,
  };

  if (!userEmail) {
    errorsMessages.emailEmpty = "Can't be empty";
  }

  if (!password) {
    errorsMessages.passwordEmpty = "Can't be empty";
  }

  if (!repeatPassword) {
    errorsMessages.repeatPassword = "Can't be empty";
  }

  if (password && repeatPassword && password !== repeatPassword) {
    errorsMessages.passwordsCompare = "Passwords do not match";
  }

  if (password) {
    if (password.length < 8) {
      errorsMessages.passwordMinimumCharacters =
        "Password must have at least 8 characters";
    }
    if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errorsMessages.passwordCapitalLetterAndSpecialCharacter =
        'Password must contain at least one capital letter and one special character (!@#$%^&*(),.?":{}|<>)';
    }
  }

  // Sprawdzenie, czy są jakiekolwiek błędy
  const hasErrors = Object.values(errorsMessages).some(
    (error) => error !== false
  );
  if (hasErrors) {
    return res.status(400).json(errorsMessages);
  }

  try {
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      errorsMessages.emailTaken = "User already exists";
      return res.status(400).json(errorsMessages);
    }

    const trimmedPassword = password.trim(); //usunięcie spacji
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = await User.create({
      userEmail,
      password: hashedPassword,
    });

    //Generowanie tokena, po rejestracji użytkownik zostanie zalogowany i powstanie token
    const token = jwt.sign(
      { id: user._id, email: user.userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token });
  } catch (error) {
    if (error.name === "Validation Error") {
      //Przechwytuje błędy walidacji Mongoose
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: messages });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Logowanie

router.post("/login", async (req, res) => {
  const { userEmail, password } = req.body;

  const errorsMessages = {
    emailEmpty: false,
    passwordEmpty: false,
    wrongEmailOrPassword: false,
  };

  if (!userEmail) {
    errorsMessages.emailEmpty = "Can't be empty";
  }
  if (!password) {
    errorsMessages.passwordEmpty = "Can't be empty";
  }

  if (errorsMessages.emailEmpty || errorsMessages.passwordEmpty) {
    return res.status(400).json(errorsMessages);
  }

  try {
    const user = await User.findOne({ userEmail });
    if (!user) {
      errorsMessages.wrongEmailOrPassword = "Wrong email or password";
      return res.status(400).json(errorsMessages);
    }

    const trimmedPassword = password.trim(); //usunięcie spacji

    const isMatch = await bcrypt.compare(trimmedPassword, user.password); //jeśli hasła się różnią
    if (!isMatch) {
      errorsMessages.wrongEmailOrPassword = "Wrong email or password";
      return res.status(400).json(errorsMessages);
    }

    const token = jwt.sign(
      { id: user._id, email: user.userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
