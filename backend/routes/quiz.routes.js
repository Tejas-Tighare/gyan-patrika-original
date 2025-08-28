import express from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
  getAdminQuizzes,
  updateQuiz,
} from "../controllers/quiz.controller.js";

import { pdfUploadHandler } from "./quiz.js"; // PDF upload handler

const quizRouter = express.Router();

// Admin only routes
quizRouter.post("/", authMiddleware, requireAdmin, createQuiz);
quizRouter.delete("/:id", authMiddleware, requireAdmin, deleteQuiz);
quizRouter.get("/my-quizzes", authMiddleware, requireAdmin, getAdminQuizzes);
quizRouter.put("/:id", authMiddleware, requireAdmin, updateQuiz);

// All logged-in users
quizRouter.get("/", authMiddleware, getAllQuizzes);
quizRouter.get("/:id", authMiddleware, getQuizById);

// ✅ PDF upload route (POST)
quizRouter.post("/upload", authMiddleware, pdfUploadHandler);

export default quizRouter;
