import React, { useState } from "react";
import UploadPreview from "./UploadPreview";

export default function CodePractice({ onSave, quizzes }) {
  const [codeInput, setCodeInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [showMeta, setShowMeta] = useState(false);

  // Parse code into quiz format: each non-comment line becomes a blank, comments are hints
  const handlePreview = () => {
    setError("");
    if (!codeInput.trim()) {
      setError("Paste some code to create a quiz.");
      return;
    }
    const lines = codeInput.split("\n");
    let questions = [];
    let pendingComments = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.trim()) continue; // skip empty lines
      const commentOnly = line.trim().startsWith("#");
      if (commentOnly) {
        pendingComments.push(line.replace(/^\s*#/, "").trim());
        continue;
      }
      // Inline comment
      const commentMatch = line.match(/#(.*)$/);
      let codePart = line.replace(/#.*$/, "").replace(/\s+$/, "");
      let hint = "";
      if (pendingComments.length > 0) {
        hint = pendingComments.join(" | ");
        pendingComments = [];
      }
      if (commentMatch) {
        hint = hint ? hint + " | " + commentMatch[1].trim() : commentMatch[1].trim();
      }
      if (codePart.trim()) {
        questions.push({
          q: codePart,
          hint,
          answer: codePart
        });
      }
    }
    if (questions.length === 0) {
      setError("No code lines detected.");
      return;
    }
    setPreview({ questions });
    setShowMeta(true);
  };

  // Save quiz (called from UploadPreview)
  const handleSave = (fields) => {
    if (preview && preview.questions.length > 0) {
      const quizObj = {
        ...preview,
        notebook: fields?.notebook || "",
        section: fields?.section || "",
        part: fields?.part || "",
        title: fields?.title || "Code Practice Quiz"
      };
      onSave(quizObj);
      setCodeInput("");
      setPreview(null);
      setShowMeta(false);
    }
  };

  return (
    <div className="mb-6">
      {!showMeta ? (
        <>
          <div className="flex gap-2 mb-2">
            <label className="block text-sm font-bold">Paste Python code below (comments will be hints):</label>
          </div>
          <textarea
            className="w-full h-40 p-3 border rounded bg-white text-sm font-mono"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            placeholder="Paste your code here..."
          />
          <div className="flex gap-2 mt-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePreview}>Preview Quiz</button>
          </div>
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        </>
      ) : (
        <UploadPreview
          preview={preview}
          validation={{ valid: true, errors: [] }}
          onSave={handleSave}
          onCancel={() => { setShowMeta(false); setPreview(null); }}
          quizzes={quizzes}
        />
      )}
    </div>
  );
}
