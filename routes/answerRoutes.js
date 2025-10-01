import express from "express";
import db from "../config/dbConfig.js";

const router = express.Router();

// Get answers for a question
router.get("/:question_id", async (req, res) => {
  const { question_id } = req.params;

  try {
    const [answers] = await db.query(
      `SELECT 
         a.answer_id, 
         a.answer, 
         u.username AS user_name, 
         a.created_at 
       FROM answers a 
       JOIN users u ON a.user_id = u.user_id 
       WHERE a.question_id = ? 
       ORDER BY a.created_at ASC`,
      [question_id]
    );

    if (answers.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No answers found for this question.",
      });
    }

    res.status(200).json({ answers });
  } catch (err) {
    console.error("Get Answers Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
});

// Post an answer for a question
router.post("/", async (req, res) => {
  const { question_id, answer, user_id } = req.body;

  if (!question_id || !answer || !user_id) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Please provide question_id, answer, and user_id",
    });
  }

  try {
    await db.query(
      "INSERT INTO answers (question_id, answer, user_id) VALUES (?, ?, ?)",
      [question_id, answer, user_id]
    );

    res.status(201).json({ message: "Answer posted successfully" });
  } catch (err) {
    console.error("Post Answer Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
});

export default router;
