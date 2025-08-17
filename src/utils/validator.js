// src/utils/validator.js
// Validates quiz JSON files for the fitb app


// Only check max length and type, allow empty string
const TITLE_REGEX = /^.{0,120}$/;
const NOTEBOOK_REGEX = /^[A-Za-z0-9_\- ]{0,100}$/;
const SECTION_REGEX = /^[A-Za-z0-9_\- ]{0,100}$/;
const PART_REGEX = /^[A-Za-z0-9_\- ]{0,100}$/;
const QUESTION_REGEX = /^.{1,500}$/;
const MAX_QUESTIONS = 300;

export function validateQuizJSON(json) {
	const errors = [];

	if (typeof json !== "object" || json === null) {
		errors.push("Root must be an object.");
		return { valid: false, errors };
	}

	// Title
	if (typeof json.title !== "string" || !TITLE_REGEX.test(json.title)) {
		errors.push("title: string (0–120 chars) required.");
	}

	// Notebook
	if (typeof json.notebook !== "string" || !NOTEBOOK_REGEX.test(json.notebook)) {
		errors.push("notebook: string (0–100 chars, A–Z a–z 0–9 _ - space) required.");
	}

	// Section
	if (typeof json.section !== "string" || !SECTION_REGEX.test(json.section)) {
		errors.push("section: string (0–100 chars, A–Z a–z 0–9 _ - space) required.");
	}

	// Part
	if (typeof json.part !== "string" || !PART_REGEX.test(json.part)) {
		errors.push("part: string (0–100 chars, A–Z a–z 0–9 _ - space) required.");
	}

	// Questions
	if (!Array.isArray(json.questions) || json.questions.length === 0) {
		errors.push("questions: non-empty array required.");
	} else if (json.questions.length > MAX_QUESTIONS) {
		errors.push(`questions: max ${MAX_QUESTIONS} allowed.`);
	} else {
		json.questions.forEach((qObj, idx) => {
			if (typeof qObj !== "object" || typeof qObj.q !== "string" || !QUESTION_REGEX.test(qObj.q)) {
				errors.push(`questions[${idx}]: q must be a string (1–500 chars).`);
			}
			// Support multiple answers: a1, a2, ...
			const answerKeys = Object.keys(qObj).filter(k => /^a\d+$/.test(k));
			if (answerKeys.length === 0) {
				errors.push(`questions[${idx}]: at least one answer (a1, a2, ...) required.`);
			}
			answerKeys.forEach(aKey => {
				if (typeof qObj[aKey] !== "string" || !QUESTION_REGEX.test(qObj[aKey])) {
					errors.push(`questions[${idx}]: ${aKey} must be a string (1–500 chars).`);
				}
			});
		});
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
