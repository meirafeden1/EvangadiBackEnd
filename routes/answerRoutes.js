import express from "express";
import { getAnswers, postAnswer } from "../controllers/answerController.js";

const router = express.Router();

router.get("/:question_id", getAnswers);
router.post("/", postAnswer);

export default router;
