// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/dbConfig.js";

const router = express.Router();

// Helper function to safely get properties
const getBodyProperty = (body, prop) =>
  body && body[prop] ? body[prop] : undefined;

// ================== REGISTER ==================
router.post("/register", async (req, res) => {
  try {
    const { username, first_name, last_name, email, password } = req.body;

    // Validation
    if (!username || !first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [userExists] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db.query(
      "INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const email = getBodyProperty(req.body, "email");
    const password = getBodyProperty(req.body, "password");

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user || user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const existingUser = user[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: existingUser.user_id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: existingUser.user_id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== CHECK USER ==================
router.get("/checkUser", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user info from DB
    const [user] = await db.query("SELECT user_id, username, email FROM users WHERE user_id = ?", [
      decoded.id,
    ]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User authenticated", user: user[0] });
  } catch (err) {
    console.error("CheckUser error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});


export default router;
