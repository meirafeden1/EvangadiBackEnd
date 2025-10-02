import express from "express";
import { register, login, checkUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/checkUser", checkUser);

export default router;
