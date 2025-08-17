// src/HierarchicalSidebar.jsx
import React from "react";

export default function HierarchicalSidebar({ quizzes, selected, onSelect, search, onSearch }) {
  // Extract unique notebooks, sections, parts
  const notebooks = Array.from(new Set(quizzes.map(q => q.notebook))).sort();
  const sections = selected.notebook
    ? Array.from(new Set(quizzes.filter(q => q.notebook === selected.notebook).map(q => q.section))).sort()
    : [];
  const parts = selected.section
    ? Array.from(new Set(quizzes.filter(q => q.notebook === selected.notebook && q.section === selected.section).map(q => q.part))).sort()
    : [];
  const quizTitles = selected.part
    ? quizzes.filter(q => q.notebook === selected.notebook && q.section === selected.section && q.part === selected.part)
    : [];

  return (
    <div className="w-64 p-6 bg-white border-r min-h-screen">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="mb-4">
        <h3 className="font-bold text-sm mb-2">Notebooks</h3>
        <ul>
          {notebooks.map(nb => (
            <li key={nb}>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-xs ${selected.notebook === nb ? "bg-blue-200" : ""}`}
                onClick={() => onSelect({ notebook: nb, section: null, part: null })}
              >
                {nb}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-sm mb-2">Sections</h3>
        <ul>
          {sections.map(sec => (
            <li key={sec}>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-xs ${selected.section === sec ? "bg-blue-200" : ""}`}
                onClick={() => onSelect({ ...selected, section: sec, part: null })}
              >
                {sec}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-sm mb-2">Parts</h3>
        <ul>
          {parts.map(pt => (
            <li key={pt}>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 text-xs ${selected.part === pt ? "bg-blue-200" : ""}`}
                onClick={() => onSelect({ ...selected, part: pt })}
              >
                {pt}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-sm mb-2">Quizzes</h3>
        <ul>
          {quizTitles.map(qz => (
            <li key={qz.id || qz.title}>
              <span className="block px-2 py-1 text-xs">{qz.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
