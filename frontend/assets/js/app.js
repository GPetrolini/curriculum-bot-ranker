// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = "https://sua-api.com/candidates"; // 🔧 Troque pela URL real do backend

// ── State ─────────────────────────────────────────────────────────────────────

let candidates = []; // preenchido pelo fetch

// ── Mock (remover quando o backend estiverr conectado) ─────────────────────────

const MOCK_DATA = [
  {
    status: "success",
    candidate_id: "93ce286a-954a-4510-8e35-95689376e716",
    name: "Ana Clara",
    email: "ana@example.com",
    phone: "+5511999999999",
    summary: "Engenheira de dados com 5 anos de experiência em Python, ETL e GCP.",
    skills: ["python", "sql", "airflow"],
    experience_years: 5,
    final_score: 78.5,
    ranking_level: "BOM",
  },
  {
    status: "success",
    candidate_id: "1a2b3c4d-0000-0000-0000-000000000001",
    name: "Bruno Martins",
    email: "bruno@example.com",
    phone: "+5521988887777",
    summary: "Analista de dados focado em BI, Power BI e modelagem dimensional.",
    skills: ["power bi", "sql", "excel"],
    experience_years: 3,
    final_score: 87.0,
    ranking_level: "ÓTIMO",
  },
  {
    status: "success",
    candidate_id: "1a2b3c4d-0000-0000-0000-000000000002",
    name: "Carla Souza",
    email: "carla@example.com",
    phone: "+5531977776666",
    summary: "UX designer com foco em pesquisa com usuários e prototipação em Figma.",
    skills: ["figma", "user research", "prototyping"],
    experience_years: 4,
    final_score: 65.0,
    ranking_level: "REGULAR",
  },
  {
    status: "success",
    candidate_id: "1a2b3c4d-0000-0000-0000-000000000003",
    name: "Diego Alves",
    email: "diego@example.com",
    phone: "+5541966665555",
    summary: "Engenheiro back-end especializado em Node.js, microsserviços e AWS.",
    skills: ["node.js", "docker", "aws"],
    experience_years: 6,
    final_score: 91.0,
    ranking_level: "ÓTIMO",
  },
  {
    status: "success",
    candidate_id: "1a2b3c4d-0000-0000-0000-000000000004",
    name: "Elisa Cunha",
    email: "elisa@example.com",
    phone: "+5551955554444",
    summary: "Product manager com experiência em squads ágeis e roadmap estratégico.",
    skills: ["scrum", "jira", "roadmapping"],
    experience_years: 7,
    final_score: 94.0,
    ranking_level: "ÓTIMO",
  },
  {
    status: "success",
    candidate_id: "1a2b3c4d-0000-0000-0000-000000000005",
    name: "Fábio Ramos",
    email: "fabio@example.com",
    phone: "+5561944443333",
    summary: "DevOps engineer com sólida experiência em CI/CD, Kubernetes e Terraform.",
    skills: ["kubernetes", "terraform", "github actions"],
    experience_years: 5,
    final_score: 55.0,
    ranking_level: "FRACO",
  },
];

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

    updateStats();
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

// ── Stats ─────────────────────────────────────────────────────────────────────

function updateStats() {
  if (!candidates.length) return;

  // % com ranking ÓTIMO
  const otimo = candidates.filter(c => c.ranking_level === "ÓTIMO").length;
  const pct   = Math.round((otimo / candidates.length) * 100);
  document.getElementById("pctOtimo").textContent = `${pct}%`;

  // candidato com maior nota
  const top = candidates.reduce((a, b) => a.final_score > b.final_score ? a : b);
  document.getElementById("topScore").textContent = formatScore(top.final_score);
  document.getElementById("topName").textContent  = top.name;
}

// ── Render List ───────────────────────────────────────────────────────────────

function renderRow(candidate, index) {
  const av      = getAvatarColor(candidate.name);
  const ranking = getRanking(candidate.ranking_level);

  const skillsHtml = candidate.skills
    .map(s => `<span class="row-skill">${s}</span>`)
    .join("");

  return `
    <div class="row" onclick="openModal('${candidate.candidate_id}')">
      <div class="av" style="background:${av.bg}; color:${av.color}">
        ${getInitials(candidate.name)}
      </div>
      <div class="info">
        <div class="cname">${candidate.name}</div>
        <div class="crole">${candidate.email}</div>
        <div class="row-skills">${skillsHtml}</div>
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
