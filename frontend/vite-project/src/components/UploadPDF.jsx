import React, { useState } from "react";
import API from "../utils/api";

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      // No need to set headers manually – interceptor adds Authorization
      const response = await API.post("/quiz/upload", formData);

      setSuccess("Quiz created successfully from PDF!");
      console.log("✅ Upload success:", response.data);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload and process PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Quiz PDF</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default UploadPDF;
