// ── State ─────────────────────────────────────────────────────────────────────

let candidates = [];

// Status possíveis por candidato: null | "entrevista" | "contratado"
const candidateStatus = JSON.parse(localStorage.getItem("candidateStatus") || "{}");

let activeVaga  = null; // null = Todos
let currentPage = 1;
const PAGE_SIZE = 15;
