// src/utils/db.js
import { openDB } from "idb";

const DB_NAME = "fib_vault";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("quizzes")) {
      const store = db.createObjectStore("quizzes", { keyPath: "id" });
      store.createIndex("by_folder", "folder");
      store.createIndex("by_title", "title");
      store.createIndex("by_hash", "sourceHash");
    }
    if (!db.objectStoreNames.contains("quizMeta")) {
      db.createObjectStore("quizMeta", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("folders")) {
      db.createObjectStore("folders", { keyPath: "path" });
    }
  },
});

// --- CRUD helpers (MVP) ---
export async function saveQuiz(quiz) {
  const db = await dbPromise;
  await db.put("quizzes", quiz);
  return quiz.id;
}

export async function getAllQuizzes() {
  const db = await dbPromise;
  return db.getAll("quizzes");
}

export async function getQuizzesByFolder(folder) {
  const db = await dbPromise;
  return db.getAllFromIndex("quizzes", "by_folder", folder);
}

export async function getQuiz(id) {
  const db = await dbPromise;
  return db.get("quizzes", id);
}

export async function upsertQuizMeta(meta) {
  const db = await dbPromise;
  await db.put("quizMeta", meta);
}

export async function getQuizMeta(id) {
  const db = await dbPromise;
  return db.get("quizMeta", id);
}

export async function upsertFolderMeta(meta) {
  const db = await dbPromise;
  await db.put("folders", meta);
}

export async function getAllFolderMeta() {
  const db = await dbPromise;
  return db.getAll("folders");
}
