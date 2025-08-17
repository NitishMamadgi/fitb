// src/FolderTree.jsx
import React from "react";

export default function FolderTree({ folders, selected, onSelect }) {
  if (!folders || folders.length === 0) {
    return <div className="text-gray-500">No folders found.</div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-md font-bold mb-2">Folders</h2>
      <ul className="space-y-1">
        {folders.map((folder) => (
          <li key={folder}>
            <button
              className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 ${selected === folder ? "bg-blue-200 font-semibold" : ""}`}
              onClick={() => onSelect(folder)}
            >
              {folder}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
