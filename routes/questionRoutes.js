import express from "express";
import {
  getAllQuestions,
  getSingleQuestion,
  createQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/:question_id", getSingleQuestion);
router.post("/", createQuestion);

export default router;
