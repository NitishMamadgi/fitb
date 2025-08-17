// src/App.jsx
import { useEffect, useState } from "react";
import { dbPromise } from "./utils/db";
import { validateQuizJSON } from "./utils/validator";
import UploadPreview from "./UploadPreview";
import QuizList from "./QuizList";
import HierarchicalSidebar from "./HierarchicalSidebar";
import QuizRunner from "./QuizRunner";

export default function App() {
  const [preview, setPreview] = useState(null);
  const [validation, setValidation] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState({ notebook: null, section: null, part: null });
  const [search, setSearch] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);

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

  // Utility to slugify title
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // Utility to hash JSON (simple, not cryptographic)
  function simpleHash(obj) {
    return btoa(JSON.stringify(obj)).slice(0, 16);
  }

  // Filter quizzes by notebook/section/part and search
  const filteredQuizzes = quizzes.filter(q => {
    const matchesNotebook = selected.notebook ? q.notebook === selected.notebook : true;
    const matchesSection = selected.section ? q.section === selected.section : true;
    const matchesPart = selected.part ? q.part === selected.part : true;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.notebook && q.notebook.toLowerCase().includes(search.toLowerCase())) ||
      (q.section && q.section.toLowerCase().includes(search.toLowerCase())) ||
      (q.part && q.part.toLowerCase().includes(search.toLowerCase()));
    return matchesNotebook && matchesSection && matchesPart && matchesSearch;
  });

  // After saving a quiz, auto-select and show QuizRunner for the saved quiz
  const handleSave = async (fields) => {
    if (preview && validation && validation.valid) {
      const now = Date.now();
      const quizToSave = {
        ...preview,
        notebook: fields?.notebook ?? preview.notebook,
        section: fields?.section ?? preview.section,
        part: fields?.part ?? preview.part,
        title: fields?.title ?? preview.title,
        id: slugify(fields?.title ?? preview.title) + "-" + now,
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
      setSelected({
        notebook: quizToSave.notebook,
        section: quizToSave.section,
        part: quizToSave.part
      });
      setActiveQuiz(quizToSave);
      setShowHome(false);
    }
  };

  // Delete quiz by id
  const handleDeleteQuiz = async (id) => {
    const db = await dbPromise;
    await db.delete("quizzes", id);
    fetchQuizzes();
  };

  // State for text area input
  const [textInput, setTextInput] = useState("");
  const [textError, setTextError] = useState("");
  const [showHome, setShowHome] = useState(true);

  // Handle parsing from text area
  const handleTextParse = () => {
    setTextError("");
    try {
      let json = JSON.parse(textInput);
      // Add missing metadata keys as empty strings
      json = {
        notebook: typeof json.notebook === "string" ? json.notebook : "",
        section: typeof json.section === "string" ? json.section : "",
        part: typeof json.part === "string" ? json.part : "",
        title: typeof json.title === "string" ? json.title : "",
        ...json
      };
      const result = validateQuizJSON(json);
      setPreview(json);
      setValidation(result);
      setShowHome(false);
    } catch (err) {
      setTextError("Error parsing JSON: " + err.message);
    }
  };

  // Example prompt for LLM (no metadata)
  const examplePrompt = `Create fill-in-the-blanks questions in the following JSON format. For questions with multiple blanks, provide answers as a1, a2, etc.\n\n{\n  \"questions\": [\n    { \"q\": \"The ___ is the largest planet and ___ is the smallest.\", \"a1\": \"Jupiter\", \"a2\": \"Mercury\" },\n    { \"q\": \"___ is the capital of France.\", \"a1\": \"Paris\"}\n  ]\n}`;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        let json = JSON.parse(text);
        // Add missing metadata keys as empty strings
        json = {
          notebook: typeof json.notebook === "string" ? json.notebook : "",
          section: typeof json.section === "string" ? json.section : "",
          part: typeof json.part === "string" ? json.part : "",
          title: typeof json.title === "string" ? json.title : "",
          ...json
        };
        const result = validateQuizJSON(json);
        setPreview(json);
        setValidation(result);
        setShowHome(false);
      } catch (err) {
        setPreview(null);
        setValidation({ valid: false, errors: ["Error parsing JSON: " + err.message] });
      }
    };
    reader.readAsText(file);
  };

  const handleCancel = () => {
    setPreview(null);
    setValidation(null);
    setShowHome(true);
  };

  return (
    <div className="w-screen h-screen bg-gray-100 overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center gap-4">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded font-bold"
            onClick={() => {
              setShowHome(true);
              setPreview(null);
              setValidation(null);
              setTextInput("");
              setTextError("");
              setSelected({ notebook: null, section: null, part: null }); // Reset sidebar selection
              setActiveQuiz(null);
            }}
          >Home</button>
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">FITB App</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full">
        {/* Sidebar */}
        <HierarchicalSidebar
          quizzes={quizzes}
          selected={selected}
          onSelect={setSelected}
          search={search}
          onSearch={setSearch}
        />
        {/* Main Area */}
        <div className="flex-1 p-8">
          {activeQuiz ? (
            <QuizRunner quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
          ) : showHome ? (
            (selected.notebook || selected.section || selected.part)
              ? (
                filteredQuizzes.length > 0 ? (
                  <QuizList quizzes={filteredQuizzes} onDelete={handleDeleteQuiz} onStart={quiz => setActiveQuiz(quiz)} />
                ) : (
                  <div className="text-gray-500 text-sm">No quizzes found for this selection.</div>
                )
              )
              : (
                <>
                  {/* Example prompt for LLM */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Example prompt for LLM (copy and use):</label>
                    <pre className="bg-gray-200 p-3 rounded text-xs whitespace-pre-wrap select-all" style={{ cursor: "pointer" }} onClick={() => navigator.clipboard.writeText(examplePrompt)}>{examplePrompt}</pre>
                  </div>
                  {/* Text area for direct input */}
                  <div className="mb-6">
                    <div className="flex items-center mb-2 gap-2">
                      <label className="block text-sm font-bold">Paste quiz in required format <span className="font-bold mx-1">OR</span> upload a .json/.txt file:</label>
                      <label htmlFor="file-upload" className="px-2 py-1 bg-blue-600 text-white rounded cursor-pointer font-semibold text-xs">Upload Quiz</label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".txt,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <textarea
                      className="w-full h-40 p-3 border rounded bg-white text-sm font-mono"
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="Paste your quiz here (see example prompt above)..."
                    />
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                      onClick={handleTextParse}
                    >
                      Parse & Preview
                    </button>
                    {textError && <div className="mt-2 text-red-600 text-sm">{textError}</div>}
                  </div>
                </>
              )
          ) : (
            <UploadPreview
              preview={preview}
              validation={validation}
              onSave={handleSave}
              onCancel={handleCancel}
              quizzes={quizzes}
            />
          )}
          {/* Only show QuizList if sidebar selection is active and there are quizzes */}
          {!showHome && (selected.notebook || selected.section || selected.part) && filteredQuizzes.length > 0 && !activeQuiz && (
            <QuizList quizzes={filteredQuizzes} onDelete={handleDeleteQuiz} onStart={quiz => setActiveQuiz(quiz)} />
          )}
        </div>
      </div>
    </div>
  );
}








