import React, { useState, useRef } from "react";

export default function CodeQuizRunner({ quiz, onBack }) {
  const [userInputs, setUserInputs] = useState(Array(quiz.questions.length).fill([]));
  const [revealed, setRevealed] = useState(Array(quiz.questions.length).fill([]));
  const inputRefs = useRef([]);
  const [selected, setSelected] = useState({ qIdx: null, start: null, end: null });

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="p-8">No code quiz found.</div>;

  // Remove empty lines and clean code
  const questions = quiz.questions.filter(q => q.answer && q.answer.trim());

  // Helper to split code into array of chars (including spaces)
  const splitCode = (code) => code.split("").map(c => c);

  // Handle input change for a box
  const handleInputChange = (qIdx, cIdx, value) => {
    setUserInputs(inputs => {
      const newInputs = inputs.map(arr => [...arr]);
      newInputs[qIdx][cIdx] = value;
      return newInputs;
    });
    // Auto-advance if correct
    const codeArr = splitCode(questions[qIdx].answer);
    if (value === codeArr[cIdx]) {
      // Move to next box if not last
      if (cIdx + 1 < codeArr.length) {
        setTimeout(() => {
          inputRefs.current[qIdx][cIdx + 1]?.focus();
        }, 50);
      }
    }
  };

  // Handle Enter to move to next line
  const handleKeyDown = (qIdx, cIdx, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (qIdx + 1 < questions.length) {
        inputRefs.current[qIdx + 1]?.[0]?.focus();
      }
    }
  };

  // Show/hide selected boxes
  const handleReveal = (qIdx, start, end) => {
    setRevealed(rev => {
      const newRev = rev.map(arr => [...arr]);
      for (let i = start; i <= end; i++) {
        newRev[qIdx][i] = true;
      }
      return newRev;
    });
  };
  const handleHide = (qIdx, start, end) => {
    setRevealed(rev => {
      const newRev = rev.map(arr => [...arr]);
      for (let i = start; i <= end; i++) {
        newRev[qIdx][i] = false;
      }
      return newRev;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button className="mb-4 px-3 py-1 bg-gray-300 rounded" onClick={onBack}>Back</button>
      <h2 className="text-xl font-bold mb-4">Code Practice Quiz</h2>
      <div className="mb-6">
        <div className="text-xs text-gray-500 mb-2">Type the code line by line. Comments are shown above each line. Press Enter to move to the next line.</div>
        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const codeArr = splitCode(q.answer);
            if (!userInputs[qIdx] || userInputs[qIdx].length !== codeArr.length) {
              userInputs[qIdx] = Array(codeArr.length).fill("");
            }
            if (!revealed[qIdx] || revealed[qIdx].length !== codeArr.length) {
              revealed[qIdx] = Array(codeArr.length).fill(false);
            }
            if (!inputRefs.current[qIdx]) {
              inputRefs.current[qIdx] = [];
            }
            return (
              <div key={qIdx} className="mb-2 p-2 rounded bg-gray-50 flex flex-col items-start">
                {q.hint && <div className="mb-1 text-xs text-gray-500 font-mono"># {q.hint}</div>}
                <div className="flex flex-wrap gap-1 w-full">
                  {codeArr.map((char, cIdx) => (
                    <span key={cIdx}>
                      {revealed[qIdx][cIdx] ? (
                        <span className="font-mono text-blue-700 bg-green-100 px-1 rounded">{char}</span>
                      ) : (
                        <input
                          ref={el => inputRefs.current[qIdx][cIdx] = el}
                          type="text"
                          maxLength={1}
                          className={`w-6 px-1 py-1 border rounded font-mono text-xs text-center ${userInputs[qIdx][cIdx] === char ? "bg-green-100 text-green-700" : userInputs[qIdx][cIdx] ? "bg-red-100 text-red-700" : ""}`}
                          value={userInputs[qIdx][cIdx] || ""}
                          onChange={e => handleInputChange(qIdx, cIdx, e.target.value)}
                          onKeyDown={e => handleKeyDown(qIdx, cIdx, e)}
                          onFocus={() => setSelected({ qIdx, start: cIdx, end: cIdx })}
                          onBlur={() => setSelected({ qIdx: null, start: null, end: null })}
                          onClick={e => {
                            if (e.shiftKey && selected.qIdx === qIdx) {
                              setSelected(sel => ({ ...sel, end: cIdx }));
                            } else {
                              setSelected({ qIdx, start: cIdx, end: cIdx });
                            }
                          }}
                        />
                      )}
                    </span>
                  ))}
                  {selected.qIdx === qIdx && (
                    <button
                      className="ml-2 px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs"
                      onClick={() => {
                        if (revealed[qIdx][selected.start]) {
                          handleHide(qIdx, selected.start, selected.end);
                        } else {
                          handleReveal(qIdx, selected.start, selected.end);
                        }
                      }}
                    >{revealed[qIdx][selected.start] ? "Hide" : "Show"}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
