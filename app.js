import express from "express";
import dotenv from "dotenv";
import db from "./config/dbConfig.js"; // Import DB connection
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
    connection.release();
  }
});

// Routes
app.use("/api/user", authRoutes); // Authentication routes (login, signup, checkUser)
app.use("/api/question", questionRoutes); // Question routes
app.use("/api/answer", answerRoutes); // Answer routes

// Base route
app.get("/", (req, res) => {
  res.send("Evangadi Forum API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
