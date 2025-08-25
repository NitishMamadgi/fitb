import React, { useState } from "react";

export default function QuizRunner({ quiz, onBack, onQuizUpdate }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editBlanks, setEditBlanks] = useState({});
  const [localQuiz, setLocalQuiz] = useState(quiz);
  const [editError, setEditError] = useState("");

  if (!localQuiz) return null;

  // Extract blanks for each question
  const getBlanks = (qObj) => {
    const blanks = [];
    let idx = 1;
    while (qObj[`a${idx}`] !== undefined) {
      blanks.push(`a${idx}`);
      idx++;
    }
    return blanks;
  };

  // Handle answer change
  const handleChange = (qIdx, blankKey, value) => {
    setAnswers((prev) => ({ ...prev, [`${qIdx}_${blankKey}`]: value }));
  };

  // Handle show answer toggle
  const handleShowAnswer = (qIdx) => {
    setShowAnswers((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  // Handle submit
  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Start editing a question
  const handleEdit = (qIdx) => {
    setEditIdx(qIdx);
    setEditQuestion(localQuiz.questions[qIdx].q);
    const blanks = getBlanks(localQuiz.questions[qIdx]);
    const blankValues = {};
    blanks.forEach((b) => {
      blankValues[b] = localQuiz.questions[qIdx][b];
    });
    setEditBlanks(blankValues);
  };

  // Save edited question with validation
  const handleSaveEdit = (qIdx) => {
    const blankCount = (editQuestion.match(/___+/g) || []).length;
    const answerCount = Object.keys(editBlanks).length;
    if (blankCount !== answerCount) {
      setEditError(`Number of blanks (___) in question (${blankCount}) must match number of answers (${answerCount}).`);
      return;
    }
    setEditError("");
    const updatedQuestions = [...localQuiz.questions];
    updatedQuestions[qIdx] = {
      q: editQuestion,
      ...editBlanks,
    };
    const updatedQuiz = { ...localQuiz, questions: updatedQuestions };
    setLocalQuiz(updatedQuiz);
    setEditIdx(null);
    if (onQuizUpdate) onQuizUpdate(updatedQuiz); // Persist to DB if needed
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditIdx(null);
    setEditQuestion("");
    setEditBlanks({});
    setEditError("");
  };

  // Handle blanks change in edit mode
  const handleEditBlankChange = (blankKey, value) => {
    setEditBlanks((prev) => ({ ...prev, [blankKey]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button className="mb-4 px-3 py-1 bg-gray-300 rounded" onClick={onBack}>Back</button>
      <h2 className="text-xl font-bold mb-2">{localQuiz.title || "Quiz"}</h2>
      {!started ? (
        <button className="px-4 py-2 bg-blue-600 text-white rounded mb-4" onClick={() => setStarted(true)}>
          Start Quiz
        </button>
      ) : (
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {localQuiz.questions.map((qObj, qIdx) => {
            const blanks = getBlanks(qObj);
            // Split question text by blanks
            let parts = qObj.q.split(/___+/);
            const showAllAnswers = submitted;
            const isEditing = editIdx === qIdx;

            return (
              <div key={qIdx} className="mb-6 p-3 border rounded bg-white text-sm">
                <div className="mb-2 font-semibold flex items-center">
                  Question {qIdx + 1}:
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-blue-600"
                    title="Edit question"
                    onClick={() => handleEdit(qIdx)}
                  >
                    <span role="img" aria-label="edit">✏️</span>
                  </button>
                </div>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      className="mb-2 px-2 py-1 border rounded w-full"
                      value={editQuestion}
                      onChange={e => setEditQuestion(e.target.value)}
                    />
                    {Object.keys(editBlanks).map((b, i) => (
                      <div key={b} className="mb-1 flex items-center">
                        <span className="mr-2">Answer {i + 1}:</span>
                        <input
                          type="text"
                          className="px-2 py-1 border rounded w-32"
                          value={editBlanks[b] || ""}
                          onChange={e => handleEditBlankChange(b, e.target.value)}
                        />
                        <button
                          type="button"
                          className="ml-2 text-red-500 text-xs px-2 py-1 border rounded"
                          onClick={() => {
                            const newBlanks = { ...editBlanks };
                            delete newBlanks[b];
                            setEditBlanks(newBlanks);
                          }}
                        >Remove</button>
                        <button
                          type="button"
                          className="ml-2 text-green-500 text-xs px-2 py-1 border rounded"
                          title="Add blank/answer after this"
                          onClick={() => {
                            const keys = Object.keys(editBlanks);
                            const newBlanks = {};
                            let inserted = false;
                            for (let idx = 0; idx < keys.length; idx++) {
                              newBlanks[keys[idx]] = editBlanks[keys[idx]];
                              if (keys[idx] === b && !inserted) {
                                // Insert new blank after current
                                const newKey = "a" + (keys.length + 1);
                                newBlanks[newKey] = "";
                                inserted = true;
                              }
                            }
                            setEditBlanks(newBlanks);
                          }}
                        >+</button>
                      </div>
                    ))}
                    {editError && <div className="text-red-600 text-xs mb-2">{editError}</div>}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 bg-green-500 text-white rounded"
                        onClick={() => handleSaveEdit(qIdx)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-300 rounded"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center mb-2">
                      {parts.map((part, i) => (
                        <React.Fragment key={i}>
                          <span>{part}</span>
                          {i < blanks.length && (
                            <input
                              type="text"
                              className="mx-1 px-2 py-1 border rounded text-xs w-24"
                              tabIndex={i + 1}
                              disabled={submitted}
                              value={answers[`${qIdx}_${blanks[i]}`] || ""}
                              onChange={e => handleChange(qIdx, blanks[i], e.target.value)}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    {!showAllAnswers ? (
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 rounded text-xs"
                        onClick={() => handleShowAnswer(qIdx)}
                      >
                        {showAnswers[qIdx] ? "Hide Answer" : "Show Answer"}
                      </button>
                    ) : null}
                    {(showAnswers[qIdx] || showAllAnswers) && (
                      <div className="mt-2 text-green-700 text-xs">
                        {blanks.map((b, i) => (
                          <span key={b} className="mr-2">Answer {i + 1}: <b>{qObj[b]}</b></span>
                        ))}
                      </div>
                    )}
                    {submitted && (
                      <div className="mt-2">
                        {blanks.map((b, i) => {
                          const userAns = answers[`${qIdx}_${b}`] || "";
                          const correct = userAns.trim().toLowerCase() === (qObj[b] || "").trim().toLowerCase();
                          return (
                            <span key={b} className={"mr-2 px-2 py-1 rounded " + (correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>Your answer {i + 1}: {userAns || "(blank)"}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!submitted && (
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit Quiz</button>
          )}
          {submitted && (
            <div className="mt-4 text-lg font-bold text-blue-700">Quiz Submitted!</div>
          )}
        </form>
      )}
    </div>
  );
}
