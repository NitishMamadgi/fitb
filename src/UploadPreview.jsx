// src/UploadPreview.jsx
import React, { useState, useEffect } from "react";

export default function UploadPreview({ preview, validation, onSave, onCancel, quizzes = [] }) {
  if (!preview) return null;

  const [notebook, setNotebook] = useState(preview?.notebook || "");
  const [section, setSection] = useState(preview?.section || "");
  const [part, setPart] = useState(preview?.part || "");
  const [title, setTitle] = useState(preview?.title || "");

  // Collect options from quizzes prop
  // Filtered options for cascading dropdowns
  const notebooks = Array.from(new Set(quizzes.map(q => q.notebook))).filter(Boolean);
  const sections = Array.from(new Set(
    quizzes.filter(q => q.notebook === notebook).map(q => q.section)
  )).filter(Boolean);
  const parts = Array.from(new Set(
    quizzes.filter(q => q.notebook === notebook && q.section === section).map(q => q.part)
  )).filter(Boolean);

  if (!preview) return null;

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Quiz Preview</h2>
      <div className="mb-2">
        <label className="block text-xs font-bold mb-1">Notebook</label>
        <select className="w-full mb-1 px-2 py-1 border rounded text-xs" value={notebook} onChange={e => setNotebook(e.target.value)}>
          <option value="">-- Select or type --</option>
          {notebooks.map(nb => <option key={nb} value={nb}>{nb}</option>)}
        </select>
        <input className="w-full px-2 py-1 border rounded text-xs" placeholder="Or enter notebook" value={notebook} onChange={e => setNotebook(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-bold mb-1">Section</label>
        <select className="w-full mb-1 px-2 py-1 border rounded text-xs" value={section} onChange={e => setSection(e.target.value)}>
          <option value="">-- Select or type --</option>
          {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
        </select>
        <input className="w-full px-2 py-1 border rounded text-xs" placeholder="Or enter section" value={section} onChange={e => setSection(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-bold mb-1">Part</label>
        <select className="w-full mb-1 px-2 py-1 border rounded text-xs" value={part} onChange={e => setPart(e.target.value)}>
          <option value="">-- Select or type --</option>
          {parts.map(pt => <option key={pt} value={pt}>{pt}</option>)}
        </select>
        <input className="w-full px-2 py-1 border rounded text-xs" placeholder="Or enter part" value={part} onChange={e => setPart(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-xs font-bold mb-1">Quiz Title</label>
        <input className="w-full px-2 py-1 border rounded text-xs" placeholder="Enter quiz title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div><b>Questions:</b> {preview.questions?.length || 0}</div>
      <div className="mt-2">
        <b>Status:</b> {validation?.valid ? (
          <span className="text-green-600">Valid ✅</span>
        ) : (
          <span className="text-red-600">Invalid ❌</span>
        )}
      </div>
      {!validation?.valid && (
        <ul className="text-red-600 mt-2 text-sm">
          {validation.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-2">
        {/* Custom validation for required fields */}
        {(() => {
          const notebookValid = typeof notebook === "string" && notebook.trim().length > 0 && notebook.trim().length <= 100 && /^[A-Za-z0-9 _\-]+$/.test(notebook);
          const sectionValid = typeof section === "string" && section.trim().length > 0 && section.trim().length <= 100 && /^[A-Za-z0-9 _\-]+$/.test(section);
          const partValid = typeof part === "string" && part.trim().length > 0 && part.trim().length <= 100 && /^[A-Za-z0-9 _\-]+$/.test(part);
          const titleValid = typeof title === "string" && title.trim().length > 0 && title.trim().length <= 120;
          const allValid = notebookValid && sectionValid && partValid && titleValid && validation?.valid;
          return (
            <>
              {allValid && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onSave({ notebook, section, part, title })}>
                  Save Quiz
                </button>
              )}
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>
                Cancel
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
}
