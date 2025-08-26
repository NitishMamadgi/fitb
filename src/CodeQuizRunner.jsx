import React, { useState, useRef, useEffect } from "react";

  // Defensive: get questions array
  
export default function CodeQuizRunner({ quiz, onBack }) {  
  const questions = quiz?.questions?.filter(q => q.answer && q.answer.trim()) || [];
  // Helper to split code into array of chars (including spaces)
  const splitCode = (code) => code.split("").map(c => c);

  // State for user inputs and revealed answers
  const [userInputs, setUserInputs] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const inputRefs = useRef([]);
  const [selected, setSelected] = useState({ qIdx: null, start: null, end: null });

  // Initialize userInputs and revealed arrays when quiz/questions change
  useEffect(() => {
    setUserInputs(
      questions.map(q => Array(splitCode(q.answer).length).fill(""))
    );
    setRevealed(
      questions.map(q => Array(splitCode(q.answer).length).fill(false))
    );
    inputRefs.current = questions.map(q => Array(splitCode(q.answer).length).fill(null));
  }, [quiz]);

  if (!quiz || !questions.length) return <div className="p-8">No code quiz found.</div>;

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
        <div style={{ margin: 0, padding: 0 }}>
          {questions.map((q, qIdx) => {
            const codeArr = splitCode(q.answer);
            return (
              <React.Fragment key={qIdx}>
                {q.hint && (
                  <div className="mb-1 text-xs text-gray-500 font-mono" style={{ margin: 0, padding: 0 }}>
                    # {q.hint}
                  </div>
                )}
                <div className="flex flex-wrap items-center w-full" style={{ gap: "0px", margin: 0, padding: 0 }}>
                  {codeArr.map((char, cIdx) => (
                    <span key={cIdx} style={{ position: "relative", margin: 0, padding: 0 }}>
                      {revealed[qIdx]?.[cIdx] ? (
                        <span className="font-mono text-blue-700 bg-green-100" style={{ fontSize: "13px", padding: 0, margin: 0 }}>{char}</span>
                      ) : (
                        <input
                          ref={el => {
                            if (!inputRefs.current[qIdx]) inputRefs.current[qIdx] = [];
                            inputRefs.current[qIdx][cIdx] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={userInputs[qIdx]?.[cIdx] || ""}
                          disabled={false}
                          onChange={e => handleInputChange(qIdx, cIdx, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Backspace" && !userInputs[qIdx]?.[cIdx]) {
                              if (cIdx > 0) {
                                setUserInputs(inputs => {
                                  const newInputs = inputs.map(arr => [...arr]);
                                  newInputs[qIdx][cIdx - 1] = "";
                                  return newInputs;
                                });
                                setTimeout(() => {
                                  inputRefs.current[qIdx][cIdx - 1]?.focus();
                                }, 30);
                              } else if (qIdx > 0) {
                                const prevLen = splitCode(questions[qIdx - 1].answer).length;
                                setUserInputs(inputs => {
                                  const newInputs = inputs.map(arr => [...arr]);
                                  newInputs[qIdx - 1][prevLen - 1] = "";
                                  return newInputs;
                                });
                                setTimeout(() => {
                                  inputRefs.current[qIdx - 1][prevLen - 1]?.focus();
                                }, 30);
                              }
                            } else {
                              handleKeyDown(qIdx, cIdx, e);
                            }
                          }}
                          onFocus={() => setSelected({ qIdx, start: cIdx, end: cIdx })}
                          onBlur={() => setSelected({ qIdx: null, start: null, end: null })}
                          onClick={e => {
                            if (e.shiftKey && selected.qIdx === qIdx) {
                              setSelected(sel => ({ ...sel, end: cIdx }));
                            } else {
                              setSelected({ qIdx, start: cIdx, end: cIdx });
                            }
                          }}
                          className={`font-mono text-xs text-center outline-none transition-all ${userInputs[qIdx]?.[cIdx] === char ? "bg-green-100 text-green-700 border-b-2 border-green-500" : userInputs[qIdx]?.[cIdx] ? "bg-red-100 text-red-700 border-b-2 border-red-500" : "border-b-2 border-gray-400"}`}
                          style={{ width: "12px", height: "22px", margin: "0px", padding: "0px", background: "none", border: "none", borderBottom: "2px solid #bbb" }}
                        />
                      )}
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: "2px",
                          background: "#bbb",
                          zIndex: -1,
                          margin: 0,
                          padding: 0
                        }}
                      />
                    </span>
                  ))}
                  {selected.qIdx === qIdx && (
                    <button
                      className="ml-2 px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs"
                      onClick={() => {
                        // Show/hide selected blanks
                        if (revealed[qIdx]?.[selected.start]) {
                          handleHide(qIdx, selected.start, selected.end);
                        } else {
                          handleReveal(qIdx, selected.start, selected.end);
                          // Immediately show the correct value in revealed blanks
                          setUserInputs(inputs => {
                            const newInputs = inputs.map(arr => [...arr]);
                            for (let i = selected.start; i <= selected.end; i++) {
                              if (codeArr[i] !== undefined) newInputs[qIdx][i] = codeArr[i];
                            }
                            return newInputs;
                          });
                        }
                      }}
                    >{revealed[qIdx]?.[selected.start] ? "Hide" : "Show"}</button>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ...existing code...
