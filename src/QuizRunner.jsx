import React, { useState } from "react";

export default function QuizRunner({ quiz, onBack }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) return null;

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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button className="mb-4 px-3 py-1 bg-gray-300 rounded" onClick={onBack}>Back</button>
      <h2 className="text-xl font-bold mb-2">{quiz.title || "Quiz"}</h2>
      {!started ? (
        <button className="px-4 py-2 bg-blue-600 text-white rounded mb-4" onClick={() => setStarted(true)}>
          Start Quiz
        </button>
      ) : (
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {quiz.questions.map((qObj, qIdx) => {
            const blanks = getBlanks(qObj);
            // Split question text by blanks
            let parts = qObj.q.split(/___+/);
            const showAllAnswers = submitted;
            return (
              <div key={qIdx} className="mb-6 p-3 border rounded bg-white text-sm">
                <div className="mb-2 font-semibold">Question {qIdx + 1}:</div>
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
