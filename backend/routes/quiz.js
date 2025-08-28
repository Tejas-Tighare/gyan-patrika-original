import multer from "multer";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Quiz from "../models/Quiz.js";
import env from "dotenv";

env.config();

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const pdfUploadHandler = [
  upload.single("pdf"), // multer middleware
  async (req, res) => {
    // ✅ Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded." });
    }

    try {
      // Step 1: Parse PDF
      const data = await pdfParse(req.file.buffer);
      const extractedText = data.text;

      if (!extractedText.trim()) {
        return res
          .status(400)
          .json({ message: "PDF is empty or contains no readable text." });
      }

      // Step 2: Gemini prompt
      const prompt = `
        Extract quiz information from the following text.
        Return valid JSON ONLY, strictly in this format:
        {
          "title": "Quiz title",
          "description": "Short description",
          "timeLimit": 30,
          "questions": [
            {
              "question": "What is ...?",
              "options": ["A", "B", "C", "D"],
              "answer": "B"
            }
          ]
        }
        Text: ${extractedText}
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);

      // Step 3: Strip Markdown (```json) if present
      let jsonResponse = result.response.text();
      jsonResponse = jsonResponse.replace(/```json\s*|```/g, "").trim();

      let parsedData;
      try {
        parsedData = JSON.parse(jsonResponse);
      } catch (err) {
        console.error("Gemini JSON parse error:", err, jsonResponse);
        return res
          .status(400)
          .json({ message: "Failed to parse Gemini response into JSON." });
      }

      // Step 4: Validation
      if (!parsedData.title?.trim()) {
        return res.status(400).json({ message: "Quiz title is required." });
      }
      if (!Array.isArray(parsedData.questions)) {
        return res.status(400).json({ message: "Questions must be an array." });
      }

      // Step 5: Save to DB
      const newQuiz = new Quiz({
        title: parsedData.title.trim(),
        description: parsedData.description?.trim() || "",
        timeLimit: Number(parsedData.timeLimit) || 0,
        questions: parsedData.questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((opt) => opt.trim()),
          answer: q.answer.trim(),
        })),
        createdBy: req.user.id, // ✅ Always exists
      });

      await newQuiz.save();

      res
        .status(201)
        .json({ message: "Quiz created successfully from PDF", quiz: newQuiz });
    } catch (error) {
      console.error("Error processing PDF:", error);
      res.status(500).json({ message: "Server error while processing PDF." });
    }
  },
];
