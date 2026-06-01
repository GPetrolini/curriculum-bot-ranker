// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = "https://sua-api.com/candidates"; // 🔧 Troque pela URL real do backend

// ── State ─────────────────────────────────────────────────────────────────────

let candidates = [];

// Status possíveis: null | "entrevista" | "contratado"
const candidateStatus = JSON.parse(localStorage.getItem("candidateStatus") || "{}");
 // { candidate_id: "entrevista" | "contratado" }

// ── Mock (remover quando o backend estiver conectado) ─────────────────────────

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

// ── Avatar Colors ─────────────────────────────────────────────────────────────

const avatarColors = [
  { bg: "#1e1d3a", color: "#a89ff8" },
  { bg: "#0d2a2a", color: "#5dcaa5" },
  { bg: "#2a1a1a", color: "#f0997b" },
  { bg: "#1a2014", color: "#97c459" },
  { bg: "#2a1a28", color: "#ed93b1" },
  { bg: "#1a1e2e", color: "#6ba3f5" },
  { bg: "#241a10", color: "#e0a060" },
  { bg: "#0f1e24", color: "#4ec9c9" },
];

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
  "ÓTIMO":   { badgeClass: "badge-high", label: "Ótimo"   },
  "BOM":     { badgeClass: "badge-mid",  label: "Bom"     },
  "REGULAR": { badgeClass: "badge-low",  label: "Regular" },
  "FRACO":   { badgeClass: "badge-weak", label: "Fraco"   },
};

function getRanking(level) {
  return RANKING_MAP[level] ?? { badgeClass: "badge-low", label: level };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatScore(score) {
  return Number(score).toFixed(1);
}

// ── Navegação entre páginas ───────────────────────────────────────────────────

function showPage(page) {
  document.getElementById("page-candidatos").classList.toggle("hidden", page !== "candidatos");
  document.getElementById("page-selecionados").classList.toggle("hidden", page !== "selecionados");
  document.getElementById("nav-candidatos").classList.toggle("active", page === "candidatos");
  document.getElementById("nav-selecionados").classList.toggle("active", page === "selecionados");

  if (page === "selecionados") renderSelected();
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
    await new Promise(r => setTimeout(r, 600));
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

  const otimo = candidates.filter(c => c.ranking_level === "ÓTIMO").length;
  const pct   = Math.round((otimo / candidates.length) * 100);
  document.getElementById("pctOtimo").textContent = `${pct}%`;

  const top = candidates.reduce((a, b) => a.final_score > b.final_score ? a : b);
  document.getElementById("topScore").textContent = formatScore(top.final_score);
  document.getElementById("topName").textContent  = top.name;
}

// ── Render — Lista de candidatos ──────────────────────────────────────────────

function renderRow(candidate) {
  const av      = getAvatarColor(candidate.name);
  const ranking = getRanking(candidate.ranking_level);
  const status  = candidateStatus[candidate.candidate_id];

  const skillsHtml = candidate.skills
    .map(s => `<span class="row-skill">${s}</span>`)
    .join("");

  // Botão de entrevista: desativado se já for contratado
  const btnEntrevista = status === "entrevista"
    ? `<button class="action-btn action-btn--active" onclick="removeStatus('${candidate.candidate_id}', event)">
         <i class="ti ti-calendar-check"></i> Na entrevista
       </button>`
    : status === "contratado"
    ? `<button class="action-btn action-btn--disabled" disabled>
         <i class="ti ti-calendar-event"></i> Entrevista
       </button>`
    : `<button class="action-btn" onclick="setStatus('${candidate.candidate_id}', 'entrevista', event)">
         <i class="ti ti-calendar-event"></i> Entrevista
       </button>`;

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
      <div class="row-actions">
        ${btnEntrevista}
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
  el.innerHTML = list.map(c => renderRow(c)).join("");
}

// ── Render — Página de Selecionados ──────────────────────────────────────────

function renderSelected() {
  const entrevista = candidates.filter(c => candidateStatus[c.candidate_id] === "entrevista");
  const contratado = candidates.filter(c => candidateStatus[c.candidate_id] === "contratado");

  document.getElementById("count-entrevista").textContent = entrevista.length;
  document.getElementById("count-contratado").textContent = contratado.length;

  renderSelectedList("list-entrevista", entrevista, "entrevista");
  renderSelectedList("list-contratado", contratado, "contratado");
}

function renderSelectedList(elId, list, type) {
  const el = document.getElementById(elId);

  if (list.length === 0) {
    el.innerHTML = type === "entrevista"
      ? '<div class="empty-col">Nenhum candidato na fila de entrevistas.</div>'
      : '<div class="empty-col">Nenhum candidato contratado ainda.</div>';
    return;
  }

  el.innerHTML = list.map(c => {
    const av      = getAvatarColor(c.name);
    const ranking = getRanking(c.ranking_level);

    const actionBtn = type === "entrevista"
      ? `<button class="action-btn action-btn--green" onclick="setStatus('${c.candidate_id}', 'contratado', event)">
           <i class="ti ti-user-check"></i> Contratar
         </button>
         <button class="action-btn action-btn--remove" onclick="removeStatus('${c.candidate_id}', event)">
           <i class="ti ti-x"></i>
         </button>`
      : `<button class="action-btn action-btn--remove" onclick="removeStatus('${c.candidate_id}', event)">
           <i class="ti ti-x"></i> Remover
         </button>`;

    return `
      <div class="selected-card">
        <div class="av" style="background:${av.bg}; color:${av.color}">
          ${getInitials(c.name)}
        </div>
        <div class="info">
          <div class="cname">${c.name}</div>
          <div class="crole">${c.email}</div>
          <div class="row-skills">
            ${c.skills.map(s => `<span class="row-skill">${s}</span>`).join("")}
          </div>
        </div>
        <div class="selected-card-right">
          <div class="score-pill ${ranking.badgeClass}">
            <span class="score-number">${formatScore(c.final_score)}</span>
            <span class="score-sep">/100</span>
          </div>
          <div class="selected-card-actions">${actionBtn}</div>
        </div>
      </div>
    `;
  }).join("");
}

// ── Status dos candidatos ─────────────────────────────────────────────────────

function setStatus(candidateId, status, event) {
  event.stopPropagation(); // não abre o modal
  candidateStatus[candidateId] = status;
  go();
  renderSelected();
  function setStatus(candidateId, status, event) {
  event.stopPropagation();
  candidateStatus[candidateId] = status;
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus)); // ← adiciona essa
  go();
  renderSelected();
}
}

function removeStatus(candidateId, event) {
  event.stopPropagation();
  delete candidateStatus[candidateId];
  go();
  renderSelected();
  function removeStatus(candidateId, event) {
  event.stopPropagation();
  delete candidateStatus[candidateId];
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus)); // ← adiciona essa
  go();
  renderSelected();
}
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
  rankEl.textContent = ranking.label;
  rankEl.className   = `modal-badge ${ranking.badgeClass}`;

  document.getElementById("modal-skills").innerHTML = c.skills
    .map(s => `<span class="skill-tag">${s}</span>`)
    .join("");

  document.getElementById("modal-overlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

document.addEventListener("click", e => {
  if (e.target.id === "modal-overlay") closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────

fetchCandidates();
