// src/QuizList.jsx
import React from "react";

export default function QuizList({ quizzes, onDelete, onStart }) {
  if (!quizzes || quizzes.length === 0) {
    return <div className="text-gray-500">No quizzes found.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Saved Quizzes</h2>
      <ul className="space-y-4">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-700">{quiz.title}</div>
              <div className="text-sm text-gray-600">Folder: {quiz.folder}</div>
              <div className="text-xs text-gray-400">Questions: {quiz.questions.length}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-2 py-1 bg-green-500 text-white rounded text-xs flex items-center gap-1 hover:bg-green-600"
                title="Start Quiz"
                onClick={() => onStart(quiz)}
              >
                <span>Start</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 5v14" /></svg>
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                onClick={() => onDelete(quiz.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
