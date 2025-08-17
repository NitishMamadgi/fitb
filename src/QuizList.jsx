// src/QuizList.jsx
import React from "react";

export default function QuizList({ quizzes, onDelete }) {
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
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onDelete(quiz.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
