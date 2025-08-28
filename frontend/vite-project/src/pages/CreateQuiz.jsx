// src/components/CreateQuiz.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(""); // ✅ Added time limit
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  // ✅ Delete question
  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // ✅ Handle question/option changes
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "question") {
      newQuestions[index].question = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1], 10);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === "answer") {
      newQuestions[index].answer = value;
    }
    setQuestions(newQuestions);
  };

  // ✅ Submit manually created quiz
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { title, timeLimit, questions };
      await API.post("/quiz", payload);
      setSuccess("Quiz created successfully!");
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle PDF file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  // ✅ Submit quiz via PDF upload
  const handlePDFSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      await API.post("/quizzes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Quiz created successfully from PDF!");
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload and process PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Quiz</h2>

      {/* Manual Quiz Form */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Time Limit (in minutes)"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />

        {questions.map((q, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-sm bg-gray-50 relative"
          >
            <input
              type="text"
              placeholder="Question"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
              required
              className="w-full p-2 border rounded-lg mb-2"
            />
            {q.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) =>
                  handleQuestionChange(index, `option-${i}`, e.target.value)
                }
                required
                className="w-full p-2 border rounded-lg mb-2"
              />
            ))}
            <input
              type="text"
              placeholder="Correct Answer"
              value={q.answer}
              onChange={(e) =>
                handleQuestionChange(index, "answer", e.target.value)
              }
              required
              className="w-full p-2 border rounded-lg"
            />

            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => deleteQuestion(index)}
                className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Question
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      </form>

      <hr className="my-6" />

      {/* PDF Upload Form */}
      <form onSubmit={handlePDFSubmit} className="space-y-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      {/* Feedback */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default CreateQuiz;
