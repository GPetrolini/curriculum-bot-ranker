// ── State ─────────────────────────────────────────────────────────────────────

let candidates = [];

// Status possíveis por candidato: null | "entrevista" | "contratado"
const candidateStatus = JSON.parse(localStorage.getItem("candidateStatus") || "{}");

let activeVaga  = null; // null = Todos
let currentPage = 1;
const PAGE_SIZE = 15;
let currentView = "candidatos"; // "candidatos" | "selecionados"
let dataLoaded  = false; // flag para saber se o fetch já terminou com sucesso

// Força a renderização da aba que está ativa, independentemente de timing
function updateCurrentView() {
  if (currentView === "selecionados") {
    renderSelected();
  } else {
    go();
  }
}
