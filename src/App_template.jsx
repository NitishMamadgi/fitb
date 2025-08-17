// src/App.jsx
import { useEffect, useState } from "react";
import { dbPromise } from "./utils/db";
import { validateQuizJSON } from "./utils/validator";
import UploadPreview from "./UploadPreview";
import QuizList from "./QuizList";

export default function App() {
  const [preview, setPreview] = useState(null);
  const [validation, setValidation] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    dbPromise
      .then(() => console.log("IndexedDB ready ✅"))
      .catch((e) => console.error("IndexedDB error", e));
    fetchQuizzes();
  }, []);

  // Fetch quizzes from IndexedDB
  const fetchQuizzes = async () => {
    const db = await dbPromise;
    const all = await db.getAll("quizzes");
    setQuizzes(all);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const json = JSON.parse(text);
        const result = validateQuizJSON(json);
        setPreview(json);
        setValidation(result);
      } catch (err) {
        setPreview(null);
        setValidation({ valid: false, errors: ["Error parsing JSON: " + err.message] });
      }
    };
    reader.readAsText(file);
  };

  // Utility to slugify title
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // Utility to hash JSON (simple, not cryptographic)
  function simpleHash(obj) {
    return btoa(JSON.stringify(obj)).slice(0, 16);
  }

  const handleSave = async () => {
    if (preview && validation && validation.valid) {
      const now = Date.now();
      const quizToSave = {
        ...preview,
        id: slugify(preview.title) + "-" + now,
        createdAt: now,
        updatedAt: now,
        sourceHash: simpleHash(preview),
        questions: preview.questions.map((q, idx) => ({
          ...q,
          id: "q" + (idx + 1)
        }))
      };
      await dbPromise.then(db => db.put("quizzes", quizToSave));
      setPreview(null);
      setValidation(null);
      alert("Quiz saved!");
      fetchQuizzes(); // Refresh quiz list
    }
  };

  // Delete quiz by id
  const handleDeleteQuiz = async (id) => {
    const db = await dbPromise;
    await db.delete("quizzes", id);
    fetchQuizzes();
  };

  const handleCancel = () => {
    setPreview(null);
    setValidation(null);
  };

  return (
    <div className="w-screen h-screen bg-gray-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-blue-700 tracking-tight">FITB App</h1>
        <div>
          <label htmlFor="file-upload" className="mr-2 font-medium text-gray-700">Upload Quiz:</label>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.json"
            onChange={handleFileUpload}
            className="px-2 py-1 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center w-full">
        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 p-8">
          <UploadPreview
            preview={preview}
            validation={validation}
            onSave={handleSave}
            onCancel={handleCancel}
          />
          <QuizList quizzes={quizzes} onDelete={handleDeleteQuiz} />
        </div>
      </div>
    </div>
  );
}
// ...existing code...










