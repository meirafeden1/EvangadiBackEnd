// routes/questionRoutes.js
import express from "express";
import db from "../config/dbConfig.js";

const router = express.Router();

// Get all questions
router.get("/", async (req, res) => {
  try {
    const [questions] = await db.query(
      "SELECT q.question_id, q.title, q.description, u.username AS user_name, q.created_at FROM questions q JOIN users u ON q.user_id = u.user_id ORDER BY q.created_at DESC"
    );
    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "No questions found." });
    }
    res.json({ questions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
        message: "An unexpected error occurred.",
      });
  }
});

// Get single question
router.get("/:question_id", async (req, res) => {
  const { question_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM questions WHERE question_id = ?",
      [question_id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Not Found",
          message: "The requested question could not be found.",
        });
    }
    res.json({ question: rows[0] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
        message: "An unexpected error occurred.",
      });
  }
});

// Post a new question
router.post("/", async (req, res) => {
  const { title, description, user_id } = req.body;
  if (!title || !description || !user_id) {
    return res
      .status(400)
      .json({
        error: "Bad Request",
        message: "Please provide all required fields",
      });
  }

  try {
    await db.query(
      "INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, user_id]
    );
    res.status(201).json({ message: "Question created successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
        message: "An unexpected error occurred.",
      });
  }
});

export default router;
