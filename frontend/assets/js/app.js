// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = "https://sua-api.com/candidates"; // 🔧 Troque pela URL real do backend

// ── State ─────────────────────────────────────────────────────────────────────

let candidates = []; // preenchido pelo fetch

// ── Avatar Colors — vinculadas ao nome, não à posição ────────────────────────

const avatarColors = [
  { bg: "#1e1d3a", color: "#a89ff8" }, // lilás
  { bg: "#0d2a2a", color: "#5dcaa5" }, // verde-água
  { bg: "#2a1a1a", color: "#f0997b" }, // coral
  { bg: "#1a2014", color: "#97c459" }, // verde
  { bg: "#2a1a28", color: "#ed93b1" }, // rosa
  { bg: "#1a1e2e", color: "#6ba3f5" }, // azul
  { bg: "#241a10", color: "#e0a060" }, // âmbar
  { bg: "#0f1e24", color: "#4ec9c9" }, // ciano
];

/**
 * Gera um índice de cor determinístico a partir do nome.
 * O mesmo nome sempre retorna a mesma cor, independente da posição na lista.
 */
function nameToColorIndex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % avatarColors.length;
}

function getAvatarColor(name) {
  return avatarColors[nameToColorIndex(name)];
}

// ── Ranking Config ────────────────────────────────────────────────────────────

const RANKING_MAP = {
  "ÓTIMO":   { badgeClass: "badge-high",   label: "Ótimo"   },
  "BOM":     { badgeClass: "badge-mid",    label: "Bom"     },
  "REGULAR": { badgeClass: "badge-low",    label: "Regular" },
  "FRACO":   { badgeClass: "badge-weak",   label: "Fraco"   },
};

function getRanking(level) {
  return RANKING_MAP[level] ?? { badgeClass: "badge-low", label: level };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function formatScore(score) {
  return Number(score).toFixed(1);
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchCandidates() {
  setLoading(true);

  try {
    // Descomente abaixo quando o backend estiver pronto:
    // const res  = await fetch(API_URL);
    // const data = await res.json();
    // candidates = Array.isArray(data) ? data : [data];

    // Mock (remover depois):
    await new Promise(r => setTimeout(r, 600)); // simula latência
    candidates = MOCK_DATA;

    document.getElementById("totalCount").textContent =
      candidates.length.toLocaleString("pt-BR");

    go();
  } catch (err) {
    console.error("Erro ao buscar candidatos:", err);
    document.getElementById("list").innerHTML =
      '<div class="empty">Erro ao carregar candidatos. Tente novamente.</div>';
  } finally {
    setLoading(false);
  }
}

// ── Loading ───────────────────────────────────────────────────────────────────

function setLoading(state) {
  const el = document.getElementById("list");
  if (state) {
    el.innerHTML = `
      <div class="empty">
        <div class="spinner"></div>
        Carregando candidatos...
      </div>`;
  }
}

// ── Render List ───────────────────────────────────────────────────────────────

function renderRow(candidate, index) {
  const av      = getAvatarColor(candidate.name);
  const ranking = getRanking(candidate.ranking_level);

  return `
    <div class="row" onclick="openModal('${candidate.candidate_id}')">
      <div class="av" style="background:${av.bg}; color:${av.color}">
        ${getInitials(candidate.name)}
      </div>
      <div class="info">
        <div class="cname">${candidate.name}</div>
        <div class="crole">${candidate.email}</div>
      </div>
      <div class="row-score">
        <div class="score-pill ${ranking.badgeClass}">
          <span class="score-number">${formatScore(candidate.final_score)}</span>
          <span class="score-sep">/100</span>
        </div>
        <div class="score-label ${ranking.badgeClass}-text">${ranking.label}</div>
      </div>
    </div>
  `;
}

function render(list) {
  const el = document.getElementById("list");

  if (list.length === 0) {
    el.innerHTML = '<div class="empty">Nenhum candidato encontrado.</div>';
    return;
  }

  el.innerHTML = list.map((c, i) => renderRow(c, i)).join("");
}

// ── Filter & Sort ─────────────────────────────────────────────────────────────

function go() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const sort  = document.getElementById("sortSelect").value;

  let list = candidates.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query) ||
    c.skills.some(s => s.toLowerCase().includes(query))
  );

  if (sort === "asc") {
    list = [...list].sort((a, b) => b.final_score - a.final_score);
  } else if (sort === "desc") {
    list = [...list].sort((a, b) => a.final_score - b.final_score);
  } else {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  render(list);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(candidateId) {
  const c = candidates.find(c => c.candidate_id === candidateId);
  if (!c) return;

  const ranking = getRanking(c.ranking_level);

  document.getElementById("modal-name").textContent    = c.name;
  document.getElementById("modal-email").textContent   = c.email;
  document.getElementById("modal-phone").textContent   = c.phone;
  document.getElementById("modal-summary").textContent = c.summary;
  document.getElementById("modal-exp").textContent     = `${c.experience_years} anos`;
  document.getElementById("modal-score").textContent   = `${formatScore(c.final_score)}%`;
  document.getElementById("modal-id").textContent      = c.candidate_id;

  const rankEl = document.getElementById("modal-ranking");
  rankEl.textContent  = ranking.label;
  rankEl.className    = `modal-badge ${ranking.badgeClass}`;

  document.getElementById("modal-skills").innerHTML = c.skills
    .map(s => `<span class="skill-tag">${s}</span>`)
    .join("");

  document.getElementById("modal-overlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

// fechar ao clicar fora
document.addEventListener("click", e => {
  if (e.target.id === "modal-overlay") closeModal();
});

// fechar com ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────

fetchCandidates();
