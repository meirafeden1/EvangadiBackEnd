import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";



// Register Controller
export const register = async (req, res) => {
  try {
    const { username, first_name, last_name, email, password } = req.body;
    if (!username || !first_name || !last_name || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
    }

    const [userExists] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (userExists.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already registered" });
    }
    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Password must be at least 8 characters long" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, hashedPassword]
    );

    res.status(StatusCodes.CREATED).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user || user.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const existingUser = user[0];
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

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
};

// Check User Controller
export const checkUser = async (req, res) => {
  try {
    //  No need to extract token again, middleware already did it
    const userId = req.user.id;

    const [user] = await db.query(
      "SELECT user_id, username, email FROM users WHERE user_id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ message: "User authenticated", user: user[0] });
  } catch (err) {
    console.error("CheckUser error:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
