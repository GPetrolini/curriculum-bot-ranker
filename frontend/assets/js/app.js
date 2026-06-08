// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:8000"; // 🔧 Troque pela URL base do backend se necessário
const API_URL  = `${API_BASE}/candidates/`;

// ── State ─────────────────────────────────────────────────────────────────────

let candidates = [];

// Status possíveis: null | "entrevista" | "contratado"
const candidateStatus = JSON.parse(localStorage.getItem("candidateStatus") || "{}");

// ── Vagas ─────────────────────────────────────────────────────────────────────

let activeVaga = null; // null = Todos

const VAGAS = [
  // Tecnologia
  { label: "Dev Back-end",         keywords: ["python", "java", "node.js", "c#", ".net", "ruby", "php", "go", "rust", "api", "rest", "graphql", "microsserviços", "backend"] },
  { label: "Dev Front-end",        keywords: ["react", "vue", "angular", "javascript", "typescript", "html", "css", "next.js", "nuxt", "tailwind", "frontend"] },
  { label: "Dev Mobile",           keywords: ["flutter", "react native", "swift", "kotlin", "android", "ios", "mobile", "dart"] },
  { label: "DevOps / Infra",       keywords: ["docker", "kubernetes", "terraform", "aws", "azure", "gcp", "ci/cd", "github actions", "jenkins", "linux", "devops", "sre", "cloud"] },
  { label: "Dados / BI",           keywords: ["python", "sql", "airflow", "spark", "hadoop", "etl", "power bi", "tableau", "looker", "dbt", "bigquery", "redshift", "engenharia de dados", "analytics", "bi"] },
  { label: "Ciência de Dados",     keywords: ["machine learning", "deep learning", "scikit-learn", "tensorflow", "pytorch", "nlp", "estatística", "r", "data science", "inteligência artificial", "ia"] },
  { label: "UX / Design",          keywords: ["figma", "ux", "ui", "user research", "prototyping", "wireframe", "design system", "adobe xd", "sketch", "product design"] },
  { label: "QA / Testes",          keywords: ["qa", "testes", "selenium", "cypress", "jest", "qualidade", "automação de testes", "bdd", "tdd"] },
  { label: "Segurança (Cyber)",    keywords: ["segurança", "cybersecurity", "pentest", "soc", "siem", "firewall", "criptografia", "compliance", "iso 27001"] },
  { label: "Product Manager",      keywords: ["product", "pm", "roadmap", "scrum", "agile", "kanban", "jira", "okr", "discovery", "produto"] },

  // Negócios & Gestão
  { label: "Administração",        keywords: ["administração", "gestão", "processos", "planejamento", "erp", "sap", "excel", "rotinas administrativas"] },
  { label: "Financeiro",           keywords: ["finanças", "financeiro", "fluxo de caixa", "contas a pagar", "contas a receber", "conciliação", "tesouraria", "excel", "sap"] },
  { label: "Contabilidade",        keywords: ["contabilidade", "contador", "fiscal", "tributário", "dctf", "sped", "irpj", "csll", "balancete", "crc"] },
  { label: "Controladoria",        keywords: ["controladoria", "controller", "orçamento", "forecast", "budget", "demonstrações financeiras", "gaap", "ifrs"] },
  { label: "Recursos Humanos",     keywords: ["rh", "recursos humanos", "recrutamento", "seleção", "folha de pagamento", "dp", "treinamento", "hrbp", "people", "clt"] },
  { label: "Jurídico",             keywords: ["direito", "jurídico", "advogado", "contratos", "compliance", "trabalhista", "tributário", "societário", "oab"] },
  { label: "Marketing",            keywords: ["marketing", "seo", "google ads", "meta ads", "mídia paga", "redes sociais", "branding", "copywriting", "crm", "inbound"] },
  { label: "Vendas / Comercial",   keywords: ["vendas", "comercial", "crm", "salesforce", "prospecção", "b2b", "b2c", "sdr", "account executive", "inside sales"] },
  { label: "Projetos (PMO)",       keywords: ["pmo", "gerente de projetos", "pmp", "prince2", "scrum", "agile", "cronograma", "gestão de projetos", "ms project"] },
  { label: "Logística / Supply",   keywords: ["logística", "supply chain", "estoque", "wms", "erp", "transporte", "armazém", "compras", "procurement", "s&op"] },

  // Engenharia & Indústria
  { label: "Eng. Civil",           keywords: ["civil", "obras", "autocad", "revit", "estrutural", "topografia", "orçamento", "construção", "crea"] },
  { label: "Eng. Elétrica",        keywords: ["elétrica", "eletricidade", "automação", "clp", "plc", "inversores", "quadro elétrico", "projetos elétricos", "nr10", "crea"] },
  { label: "Eng. Mecânica",        keywords: ["mecânica", "solidworks", "autocad", "manutenção", "projetos mecânicos", "manufatura", "crea", "cnc"] },
  { label: "Eng. Química",         keywords: ["química", "processos", "refinaria", "petroquímica", "iso 9001", "laboratório", "crea"] },
  { label: "Eng. de Produção",     keywords: ["produção", "lean", "six sigma", "melhoria contínua", "kaizen", "5s", "pcp", "chão de fábrica"] },
  { label: "Manutenção",           keywords: ["manutenção", "preventiva", "corretiva", "preditiva", "eletromecânica", "pcm", "cmms", "totvs"] },
  { label: "Qualidade",            keywords: ["qualidade", "iso 9001", "abnt", "auditoria", "bpf", "fda", "anvisa", "seis sigma", "kaizen"] },

  // Saúde
  { label: "Médico",               keywords: ["medicina", "médico", "crm", "clínica", "hospital", "cid", "prescrição", "plantão"] },
  { label: "Enfermagem",           keywords: ["enfermagem", "enfermeiro", "coren", "uti", "assistência", "curativo", "triagem", "plantão"] },
  { label: "Farmácia",             keywords: ["farmácia", "farmacêutico", "crf", "dispensação", "manipulação", "anvisa", "bpf"] },
  { label: "Psicologia",           keywords: ["psicologia", "psicólogo", "crp", "terapia", "saúde mental", "avaliação psicológica"] },
  { label: "Fisioterapia",         keywords: ["fisioterapia", "fisioterapeuta", "crefito", "reabilitação", "ortopedia", "rpg"] },
  { label: "Nutrição",             keywords: ["nutrição", "nutricionista", "cfn", "dieta", "alimentação", "saúde"] },

  // Educação
  { label: "Professor",            keywords: ["professor", "docente", "pedagogia", "licenciatura", "ensino", "didática", "plano de aula"] },
  { label: "Coordenação Pedagóg.", keywords: ["coordenação", "pedagógico", "currículo", "bncc", "gestão escolar"] },

  // Outros
  { label: "Atendimento / CS",     keywords: ["atendimento", "suporte", "customer success", "cs", "helpdesk", "n1", "n2", "zendesk", "freshdesk", "satisfação"] },
  { label: "Arquitetura",          keywords: ["arquitetura", "arquiteto", "revit", "autocad", "bim", "cau", "projeto arquitetônico"] },
  { label: "Comunicação / PR",     keywords: ["comunicação", "relações públicas", "assessoria", "imprensa", "jornalismo", "press release"] },
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
    const res  = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    candidates = Array.isArray(data.candidates) ? data.candidates : [];

    document.getElementById("totalCount").textContent =
      candidates.length.toLocaleString("pt-BR");

    updateStats();
    renderVagaFilters();
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
  document.getElementById("topName").textContent  = top.full_name;
}

// ── Filtro por Vaga ───────────────────────────────────────────────────────────

function toggleVagas() {
  const filters = document.getElementById("vagaFilters");
  const chevron = document.getElementById("vagaChevron");
  const isOpen  = !filters.classList.contains("vaga-filters--hidden");
  filters.classList.toggle("vaga-filters--hidden", isOpen);
  chevron.classList.toggle("vaga-chevron--open", !isOpen);
}

function renderVagaFilters() {
  const wrap = document.getElementById("vagaFilters");

  const allBtn = `<button class="vaga-btn ${activeVaga === null ? 'vaga-btn--active' : ''}" onclick="setVaga(null)">Todos</button>`;
  const vagaBtns = VAGAS.map(v => `
    <button class="vaga-btn ${activeVaga === v.label ? 'vaga-btn--active' : ''}" onclick="setVaga('${v.label}')">
      ${v.label}
    </button>`).join("");

  wrap.innerHTML = allBtn + vagaBtns;

  // Atualiza o label no botão toggle
  const labelEl = document.getElementById("vagaActiveLabel");
  if (labelEl) {
    labelEl.textContent = activeVaga ? activeVaga : "";
    labelEl.style.display = activeVaga ? "inline" : "none";
  }
}

function setVaga(label) {
  activeVaga = label;
  renderVagaFilters();
  go();
}

function matchesVaga(candidate, vaga) {
  if (!vaga) return true;
  const vagaObj = VAGAS.find(v => v.label === vaga);
  if (!vagaObj) return true;
  const skills = candidate.skills || [];
  const haystack = [
    ...skills,
    candidate.ai_summary || "",
    candidate.cleaned_text || "",
  ].join(" ").toLowerCase();
  return vagaObj.keywords.some(kw => haystack.includes(kw.toLowerCase()));
}

function openConfirm({ icon, title, msg, okLabel, okClass, onConfirm }) {
  document.getElementById("confirm-icon").innerHTML  = icon;
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-msg").textContent   = msg;

  const okBtn = document.getElementById("confirm-ok");
  okBtn.textContent = okLabel;
  okBtn.className   = `confirm-btn ${okClass}`;
  okBtn.onclick     = () => { onConfirm(); closeConfirm(); };

  document.getElementById("confirm-overlay").classList.add("open");
}

function closeConfirm() {
  document.getElementById("confirm-overlay").classList.remove("open");
}

document.addEventListener("click", e => {
  if (e.target.id === "confirm-overlay") closeConfirm();
});

// ── Render — Lista de candidatos ──────────────────────────────────────────────

function renderRow(candidate) {
  const av      = getAvatarColor(candidate.full_name);
  const ranking = getRanking(candidate.ranking_level);
  const status  = candidateStatus[candidate.candidate_id];

  const skills     = candidate.skills || [];
  const skillsHtml = skills
    .map(s => `<span class="row-skill">${s}</span>`)
    .join("");

  const btnEntrevista = status === "entrevista"
    ? `<button class="action-btn action-btn--active" onclick="confirmRemover('${candidate.candidate_id}', '${candidate.full_name}', 'entrevista', event)">
         <i class="ti ti-calendar-check"></i> Na entrevista
       </button>`
    : status === "contratado"
    ? `<button class="action-btn action-btn--disabled" disabled>
         <i class="ti ti-calendar-event"></i> Entrevista
       </button>`
    : `<button class="action-btn" onclick="confirmEntrevista('${candidate.candidate_id}', '${candidate.full_name}', event)">
         <i class="ti ti-calendar-event"></i> Entrevista
       </button>`;

  return `
    <div class="row" onclick="openModal('${candidate.candidate_id}')">
      <div class="av" style="background:${av.bg}; color:${av.color}">
        ${getInitials(candidate.full_name)}
      </div>
      <div class="info">
        <div class="cname">${candidate.full_name}</div>
        <div class="crole">${candidate.email || "—"}</div>
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
    const av      = getAvatarColor(c.full_name);
    const ranking = getRanking(c.ranking_level);
    const skills  = c.skills || [];

    const actionBtn = type === "entrevista"
      ? `<button class="action-btn action-btn--green" onclick="confirmContratar('${c.candidate_id}', '${c.full_name}', event)">
           <i class="ti ti-user-check"></i> Contratar
         </button>
         <button class="action-btn action-btn--remove" onclick="confirmRemover('${c.candidate_id}', '${c.full_name}', 'entrevista', event)">
           <i class="ti ti-x"></i>
         </button>`
      : `<button class="action-btn action-btn--remove" onclick="confirmRemover('${c.candidate_id}', '${c.full_name}', 'contratado', event)">
           <i class="ti ti-x"></i> Remover
         </button>`;

    return `
      <div class="selected-card">
        <div class="av" style="background:${av.bg}; color:${av.color}">
          ${getInitials(c.full_name)}
        </div>
        <div class="info">
          <div class="cname">${c.full_name}</div>
          <div class="crole">${c.email || "—"}</div>
          <div class="row-skills">
            ${skills.map(s => `<span class="row-skill">${s}</span>`).join("")}
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

// ── Confirmações ──────────────────────────────────────────────────────────────

function confirmEntrevista(candidateId, name, event) {
  event.stopPropagation();
  openConfirm({
    icon:      '<i class="ti ti-calendar-event"></i>',
    title:     "Marcar para entrevista",
    msg:       `Tem certeza que deseja marcar entrevista com ${name}?`,
    okLabel:   "Marcar entrevista",
    okClass:   "confirm-btn--ok",
    onConfirm: () => setStatus(candidateId, "entrevista"),
  });
}

function confirmContratar(candidateId, name, event) {
  event.stopPropagation();
  openConfirm({
    icon:      '<i class="ti ti-user-check"></i>',
    title:     "Contratar candidato",
    msg:       `Tem certeza que deseja marcar ${name} como contratado?`,
    okLabel:   "Contratar",
    okClass:   "confirm-btn--ok confirm-btn--green",
    onConfirm: () => setStatus(candidateId, "contratado"),
  });
}

function confirmRemover(candidateId, name, type, event) {
  event.stopPropagation();
  const msg = type === "entrevista"
    ? `Tem certeza que deseja remover ${name} da fila de entrevistas?`
    : `Tem certeza que deseja remover ${name} dos contratados?`;

  openConfirm({
    icon:      '<i class="ti ti-trash"></i>',
    title:     "Remover candidato",
    msg,
    okLabel:   "Remover",
    okClass:   "confirm-btn--ok confirm-btn--red",
    onConfirm: () => removeStatus(candidateId),
  });
}

// ── Status dos candidatos ─────────────────────────────────────────────────────

function setStatus(candidateId, status) {
  candidateStatus[candidateId] = status;
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus));
  go();
  renderSelected();
}

function removeStatus(candidateId) {
  delete candidateStatus[candidateId];
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus));
  go();
  renderSelected();
}

// ── Filter & Sort ─────────────────────────────────────────────────────────────

function go() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const sort  = document.getElementById("sortSelect").value;

  let list = candidates.filter(c => {
    const skills = c.skills || [];
    return (
      (c.full_name || "").toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query) ||
      skills.some(s => s.toLowerCase().includes(query))
    ) && matchesVaga(c, activeVaga);
  });

  if (sort === "asc") {
    list = [...list].sort((a, b) => b.final_score - a.final_score);
  } else if (sort === "desc") {
    list = [...list].sort((a, b) => a.final_score - b.final_score);
  } else {
    list = [...list].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "pt"));
  }

  render(list);
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(candidateId) {
  const c = candidates.find(c => c.candidate_id === candidateId);
  if (!c) return;

  const ranking    = getRanking(c.ranking_level);
  const skills     = c.skills || [];
  const expYears   = c.ai_seniority != null ? `${c.ai_seniority} anos` : "—";

  document.getElementById("modal-name").textContent    = c.full_name || "—";
  document.getElementById("modal-email").textContent   = c.email || "—";
  document.getElementById("modal-phone").textContent   = c.phone || "—";
  document.getElementById("modal-summary").textContent = c.ai_summary || "—";
  document.getElementById("modal-exp").textContent     = expYears;
  document.getElementById("modal-score").textContent   = `${formatScore(c.final_score)}%`;
  document.getElementById("modal-id").textContent      = c.candidate_id;

  const rankEl = document.getElementById("modal-ranking");
  rankEl.textContent = ranking.label;
  rankEl.className   = `modal-badge ${ranking.badgeClass}`;

  document.getElementById("modal-skills").innerHTML = skills
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
  if (e.key === "Escape") { closeModal(); closeConfirm(); }
});

// ── Init ──────────────────────────────────────────────────────────────────────

fetchCandidates();
